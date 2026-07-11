import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';
import { UpdateEngineerStatusDto } from './dto/update-engineer-status.dto';
import { ComplaintStatus } from '@prisma/client';

@Injectable()
export class EngineerService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(engineerId: string) {
    const assignments = await this.prisma.assignment.groupBy({
      by: ['status'],
      where: { engineerId },
      _count: { _all: true },
    });

    const total = assignments.reduce((acc, curr) => acc + curr._count._all, 0);
    const completed = assignments.find(a => a.status === 'COMPLETED')?._count._all || 0;
    const pending = assignments.find(a => a.status === 'ASSIGNED' || a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS')?._count._all || 0;

    const user = await this.prisma.user.findUnique({
      where: { id: engineerId },
      select: { preferences: true }
    });

    return { total, completed, pending, shiftStatus: user?.preferences || {}, statusBreakdown: assignments };
  }

  async getCurrentAssignments(engineerId: string) {
    return this.prisma.assignment.findMany({
      where: { 
        engineerId, 
        status: { in: ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'] } 
      },
      include: { complaint: true },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async getTodayAssignments(engineerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.prisma.assignment.findMany({
      where: {
        engineerId,
        assignedAt: { gte: today },
      },
      include: { complaint: true },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async getAssignmentHistory(engineerId: string) {
    return this.prisma.assignment.findMany({
      where: { 
        engineerId,
        status: { in: ['COMPLETED', 'FAILED'] }
      },
      include: { complaint: true },
      orderBy: { completedAt: 'desc' },
    });
  }

  async updateAssignmentStatus(engineerId: string, assignmentId: string, data: UpdateAssignmentStatusDto) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { complaint: true },
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.engineerId !== engineerId) throw new ForbiddenException('Not authorized for this assignment');

    const updateData: any = { ...data };
    if (data.status === 'COMPLETED' || data.status === 'FAILED') {
      updateData.completedAt = new Date();
    }

    const updatedAssignment = await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    if (data.status === 'COMPLETED') {
      await this.prisma.complaint.update({
        where: { id: assignment.complaintId },
        data: { status: ComplaintStatus.RESOLVED },
      });

      await this.prisma.complaintTimeline.create({
        data: {
          complaintId: assignment.complaintId,
          status: ComplaintStatus.RESOLVED,
          notes: 'Job completed by engineer',
          performedById: engineerId,
        }
      });
    } else if (data.status) {
      let complaintStatus: ComplaintStatus = assignment.complaint.status;
      if (data.status === 'IN_PROGRESS') complaintStatus = ComplaintStatus.IN_PROGRESS;
      else if (data.status === 'ACCEPTED') complaintStatus = ComplaintStatus.ASSIGNED;
      
      if (complaintStatus !== assignment.complaint.status) {
        await this.prisma.complaint.update({
          where: { id: assignment.complaintId },
          data: { status: complaintStatus },
        });
      }
    }

    return updatedAssignment;
  }

  async updateEngineerStatus(engineerId: string, data: UpdateEngineerStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id: engineerId } });
    if (!user) throw new NotFoundException('Engineer not found');

    const currentPreferences = (user.preferences as Record<string, any>) || {};
    const updatedPreferences = { ...currentPreferences, engineer: { ...currentPreferences.engineer, ...data } };

    return this.prisma.user.update({
      where: { id: engineerId },
      data: { preferences: updatedPreferences },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        preferences: true,
      }
    });
  }
}
