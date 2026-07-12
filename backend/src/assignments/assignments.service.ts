import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentStatus, ComplaintStatus, User } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssignmentDto: CreateAssignmentDto, assigner: User) {
    const assignment = await this.prisma.assignment.create({
      data: createAssignmentDto,
    });

    // Update complaint status
    await this.prisma.complaint.update({
      where: { id: createAssignmentDto.complaintId },
      data: { status: ComplaintStatus.ASSIGNED },
    });

    // Create timeline entry
    await this.prisma.complaintTimeline.create({
      data: {
        complaintId: createAssignmentDto.complaintId,
        status: ComplaintStatus.ASSIGNED,
        notes: `Assigned to engineer (ID: ${createAssignmentDto.engineerId})`,
        performedById: assigner.id,
      },
    });

    return assignment;
  }

  async findByEngineer(engineerId: string) {
    return this.prisma.assignment.findMany({
      where: { engineerId },
      include: { complaint: true },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
    user: User,
  ) {
    const assignment = await this.prisma.assignment.update({
      where: { id },
      data: {
        ...updateAssignmentDto,
        completedAt:
          updateAssignmentDto.status === AssignmentStatus.COMPLETED
            ? new Date()
            : undefined,
      },
    });

    let newComplaintStatus: ComplaintStatus | undefined = undefined;
    if (updateAssignmentDto.status === AssignmentStatus.IN_PROGRESS)
      newComplaintStatus = ComplaintStatus.IN_PROGRESS;
    if (updateAssignmentDto.status === AssignmentStatus.COMPLETED)
      newComplaintStatus = ComplaintStatus.RESOLVED;

    if (newComplaintStatus) {
      await this.prisma.complaint.update({
        where: { id: assignment.complaintId },
        data: { status: newComplaintStatus },
      });

      await this.prisma.complaintTimeline.create({
        data: {
          complaintId: assignment.complaintId,
          status: newComplaintStatus,
          notes: `Assignment status updated to ${updateAssignmentDto.status}`,
          performedById: user.id,
        },
      });
    }

    return assignment;
  }
}
