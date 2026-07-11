import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateCitizenProfileDto } from './dto/update-citizen-profile.dto';

@Injectable()
export class CitizenService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const complaints = await this.prisma.complaint.groupBy({
      by: ['status'],
      where: { reporterId: userId },
      _count: { _all: true },
    });

    const total = complaints.reduce((acc, curr) => acc + curr._count._all, 0);
    const resolved = complaints.find(c => c.status === 'RESOLVED' || c.status === 'CLOSED')?._count._all || 0;
    const pending = total - resolved;

    return { total, resolved, pending, statusBreakdown: complaints };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        preferences: true,
        savedLocations: true,
        emergencyContacts: true,
        createdAt: true,
      }
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: UpdateCitizenProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        preferences: true,
        savedLocations: true,
        emergencyContacts: true,
      }
    });
  }

  async getComplaints(userId: string) {
    return this.prisma.complaint.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getComplaintTracking(userId: string, complaintId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { 
        timeline: { 
          orderBy: { createdAt: 'desc' }, 
          include: { 
            performedBy: { select: { firstName: true, lastName: true, role: true } } 
          } 
        } 
      },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (complaint.reporterId !== userId) {
      throw new ForbiddenException('You do not have access to this complaint');
    }

    return complaint.timeline;
  }
}
