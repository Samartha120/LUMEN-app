import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AssignDispatchDto } from './dto/assign-dispatch.dto';
import type { User } from '@prisma/client';

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(dto: AssignDispatchDto, user: User) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: dto.complaintId },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    const estimatedResolutionAt = new Date();
    estimatedResolutionAt.setHours(estimatedResolutionAt.getHours() + 48); // Mock 48h ETA

    return this.prisma.$transaction(async (tx) => {
      // Create dispatch record
      const dispatchRecord = await tx.dispatchRecord.create({
        data: {
          complaintId: dto.complaintId,
          department: dto.department,
          estimatedResolutionAt,
        },
      });

      // Update complaint status
      if (complaint.status === 'PENDING') {
        await tx.complaint.update({
          where: { id: dto.complaintId },
          data: { status: 'ASSIGNED' },
        });
      }

      // Add timeline event
      await tx.complaintTimeline.create({
        data: {
          complaintId: dto.complaintId,
          status: 'ASSIGNED',
          notes: `Assigned to ${dto.department} department.`,
          performedById: user.id, // Usually a system user, but we'll use the caller for mock
        },
      });

      return dispatchRecord;
    });
  }

  async getDispatchDetails(complaintId: string) {
    return this.prisma.dispatchRecord.findMany({
      where: { complaintId },
      orderBy: { assignedAt: 'desc' },
    });
  }
}
