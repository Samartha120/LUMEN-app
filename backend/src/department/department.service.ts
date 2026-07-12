import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AllocateEngineerDto } from './dto/allocate-engineer.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { ComplaintStatus, AssignmentStatus } from '@prisma/client';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const totalComplaints = await this.prisma.complaint.count();

    const statusBreakdown = await this.prisma.complaint.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const activeEngineers = await this.prisma.user.count({
      where: { role: 'ENGINEER', isActive: true, isDeleted: false },
    });

    // SLA logic: complaints older than 48 hours that are still pending/assigned/in_progress
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const slaBreaches = await this.prisma.complaint.count({
      where: {
        createdAt: { lt: twoDaysAgo },
        status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] },
      },
    });

    return { totalComplaints, statusBreakdown, activeEngineers, slaBreaches };
  }

  async getComplaintsQueue(category?: string) {
    const where = category
      ? {
          category,
          status: {
            in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] as ComplaintStatus[],
          },
        }
      : {
          status: {
            in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] as ComplaintStatus[],
          },
        };

    return this.prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          include: {
            engineer: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async getEscalations() {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    return this.prisma.complaint.findMany({
      where: {
        OR: [
          {
            priority: 'CRITICAL',
            status: { notIn: ['RESOLVED', 'CLOSED', 'REJECTED'] },
          },
          {
            createdAt: { lt: twoDaysAgo },
            status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] },
          },
        ],
      },
      orderBy: { priority: 'desc' },
      include: {
        assignments: {
          include: {
            engineer: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async getAvailableEngineers() {
    return this.prisma.user.findMany({
      where: { role: 'ENGINEER', isActive: true, isDeleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        preferences: true,
      },
    });
  }

  async allocateEngineer(
    complaintId: string,
    departmentUserId: string,
    dto: AllocateEngineerDto,
  ) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
    });
    if (!complaint) throw new NotFoundException('Complaint not found');

    const engineer = await this.prisma.user.findUnique({
      where: { id: dto.engineerId, role: 'ENGINEER' },
    });
    if (!engineer) throw new NotFoundException('Engineer not found');

    const assignment = await this.prisma.assignment.create({
      data: {
        complaintId,
        engineerId: dto.engineerId,
        notes: dto.notes,
        status: AssignmentStatus.ASSIGNED,
      },
    });

    await this.prisma.complaint.update({
      where: { id: complaintId },
      data: { status: ComplaintStatus.ASSIGNED },
    });

    await this.prisma.complaintTimeline.create({
      data: {
        complaintId,
        status: ComplaintStatus.ASSIGNED,
        notes: 'Engineer allocated by department',
        performedById: departmentUserId,
      },
    });

    return assignment;
  }

  async getReports() {
    const closedCount = await this.prisma.complaint.count({
      where: { status: 'CLOSED' },
    });
    const resolvedCount = await this.prisma.complaint.count({
      where: { status: 'RESOLVED' },
    });
    const rejectedCount = await this.prisma.complaint.count({
      where: { status: 'REJECTED' },
    });
    const totalCompleted = closedCount + resolvedCount;

    return {
      successRate: totalCompleted / (totalCompleted + rejectedCount || 1),
      closedCount,
      resolvedCount,
      rejectedCount,
    };
  }

  async updateZones(userId: string, dto: UpdateZoneDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const currentPreferences = (user.preferences as Record<string, any>) || {};
    const updatedPreferences = {
      ...currentPreferences,
      department: { ...currentPreferences.department, zones: dto.zones },
    };

    return this.prisma.user.update({
      where: { id: userId },
      data: { preferences: updatedPreferences },
      select: { preferences: true },
    });
  }
}
