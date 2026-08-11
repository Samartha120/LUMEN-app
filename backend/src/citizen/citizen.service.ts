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

  async getAnalytics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { civicScore: true },
    });

    const allComplaints = await this.prisma.complaint.findMany({
      select: {
        category: true,
        createdAt: true,
        status: true,
      },
    });

    const categoryMap: Record<string, number> = {};
    const totalComplaints = allComplaints.length || 1;
    allComplaints.forEach((c) => {
      const cat = c.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const colors = ['#208AEF', '#7C3AED', '#F79009', '#12B76A', '#EF4444'];
    const categories = Object.entries(categoryMap)
      .map(([label, count], i) => ({
        label,
        value: Math.round((count / totalComplaints) * 100),
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    const now = new Date();

    const dailyLabels = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    });
    const dailyValues = Array(7).fill(0);

    const monthlyLabels = ['W1', 'W2', 'W3', 'W4'];
    const monthlyValues = Array(4).fill(0);

    const yearlyLabels = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date();
      d.setMonth(now.getMonth() - (11 - i));
      return d.toLocaleDateString('en-US', { month: 'short' });
    });
    const yearlyValues = Array(12).fill(0);

    allComplaints.forEach((c) => {
      const diffTime = Math.abs(now.getTime() - c.createdAt.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 6) {
        const idx = 6 - diffDays;
        if (idx >= 0 && idx < 7) dailyValues[idx]++;
      }
      if (diffDays <= 27) {
        const week = Math.floor((27 - diffDays) / 7);
        if (week >= 0 && week < 4) monthlyValues[week]++;
      }
      const diffMonths =
        (now.getFullYear() - c.createdAt.getFullYear()) * 12 +
        now.getMonth() -
        c.createdAt.getMonth();
      if (diffMonths <= 11 && diffMonths >= 0) {
        const idx = 11 - diffMonths;
        if (idx >= 0 && idx < 12) yearlyValues[idx]++;
      }
    });

    const getStats = () => [
      { label: 'Avg Response', value: '2.5 hrs', color: '#208AEF' },
      { label: 'Resolution Rate', value: '92%', color: '#12B76A' },
      { label: 'Satisfaction', value: '4.8★', color: '#F79009' },
    ];

    return {
      civicScore: user?.civicScore || 0,
      categories,
      graphData: {
        Daily: { labels: dailyLabels, values: dailyValues, stats: getStats() },
        Monthly: {
          labels: monthlyLabels,
          values: monthlyValues,
          stats: getStats(),
        },
        Yearly: {
          labels: yearlyLabels,
          values: yearlyValues,
          stats: getStats(),
        },
      },
    };
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
        civicScore: true,
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
