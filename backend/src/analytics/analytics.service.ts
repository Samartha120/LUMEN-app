import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalComplaints = await this.prisma.complaint.count();
    
    const complaintsByStatus = await this.prisma.complaint.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const complaintsByPriority = await this.prisma.complaint.groupBy({
      by: ['priority'],
      _count: { _all: true },
    });

    return {
      totalComplaints,
      complaintsByStatus: complaintsByStatus.map(s => ({ status: s.status, count: s._count._all })),
      complaintsByPriority: complaintsByPriority.map(p => ({ priority: p.priority, count: p._count._all })),
    };
  }

  async getEngineerWorkload() {
    const workload = await this.prisma.assignment.groupBy({
      by: ['engineerId'],
      _count: { _all: true },
    });
    
    return workload.map(w => ({ engineerId: w.engineerId, assignedTasks: w._count._all }));
  }
}
