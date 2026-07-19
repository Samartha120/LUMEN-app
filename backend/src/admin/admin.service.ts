import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const totalUsers = await this.prisma.user.count({
      where: { isDeleted: false },
    });
    const totalComplaints = await this.prisma.complaint.count();

    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      where: { isDeleted: false },
      _count: { _all: true },
    });

    const activeVsInactive = await this.prisma.user.groupBy({
      by: ['isActive'],
      where: { isDeleted: false },
      _count: { _all: true },
    });

    return { totalUsers, totalComplaints, usersByRole, activeVsInactive };
  }

  async getUsers(role?: Role) {
    return this.prisma.user.findMany({
      where: {
        isDeleted: false,
        ...(role && { role }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async createUser(adminId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        // @ts-ignore - IDE TS Server caching issue
        password: '',
        fullName: dto.firstName
          ? `${dto.firstName} ${dto.lastName || ''}`.trim()
          : null,
        phoneNumber: dto.phone,
        role: dto.role,
      },
    });

    await this.logAudit(adminId, 'CREATE_USER', 'User', user.id, {
      email: dto.email,
      role: dto.role,
    });

    return user;
  }

  async updateUser(adminId: string, userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
    });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    await this.logAudit(adminId, 'UPDATE_USER', 'User', user.id, dto);

    return updated;
  }

  async deleteUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
    });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true, isActive: false },
    });

    await this.logAudit(adminId, 'DELETE_USER', 'User', user.id, {
      reason: 'Soft deleted by admin',
    });

    return { success: true, message: 'User deleted successfully' };
  }

  async getComplaints(status?: string, department?: string) {
    return this.prisma.complaint.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(department && { dispatchRecords: { some: { department: department as any } } })
      },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { fullName: true, email: true } },
        dispatchRecords: true
      }
    });
  }

  async updateComplaintStatus(adminId: string, complaintId: string, status: string, notes?: string) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    const updated = await this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: status as any }
    });

    await this.prisma.complaintTimeline.create({
      data: {
        complaintId,
        status: status as any,
        notes: notes || `Status updated to ${status} by admin`,
        performedById: adminId
      }
    });

    await this.logAudit(adminId, 'UPDATE_COMPLAINT_STATUS', 'Complaint', complaint.id, {
      oldStatus: complaint.status,
      newStatus: status
    });

    return updated;
  }

  async getAuditLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, role: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  private async logAudit(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    details?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details || {},
      },
    });
  }
}
