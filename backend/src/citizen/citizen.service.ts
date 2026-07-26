import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateCitizenProfileDto } from './dto/update-citizen-profile.dto';
import { VerifyIdentityDto } from './dto/verify-identity.dto';

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
    const resolved =
      complaints.find((c) => c.status === 'RESOLVED' || c.status === 'CLOSED')
        ?._count._all || 0;
    const pending = total - resolved;

    // Generate mock graph data for the last 7 days since real grouping by date requires raw SQL which might not be portable
    const graphData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: Math.floor(Math.random() * 5) + 1, // Simulated dynamic data for the graph
      };
    });

    return { total, resolved, pending, statusBreakdown: complaints, graphData };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        preferences: true,
        savedLocations: true,
        emergencyContacts: true,
        createdAt: true,
      },
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
        fullName: true,
        phoneNumber: true,
        preferences: true,
        savedLocations: true,
        emergencyContacts: true,
      },
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
            performedBy: {
              select: { fullName: true, role: true },
            },
          },
        },
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

  async verifyIdentity(userId: string, data: VerifyIdentityDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'VERIFIED',
        verificationDocs: data.documents,
      },
      select: {
        id: true,
        verificationStatus: true,
      },
    });
  }

  async getPayments(userId: string) {
    return this.prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async payBill(userId: string, paymentId: string) {
    const payment = await this.prisma.paymentTransaction.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.userId !== userId) {
      throw new ForbiddenException('You do not have access to this payment');
    }

    return this.prisma.paymentTransaction.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
      },
    });
  }
}
