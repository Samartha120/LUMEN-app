import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async getTimelineByComplaint(complaintId: string) {
    return this.prisma.complaintTimeline.findMany({
      where: { complaintId },
      include: {
        performedBy: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
