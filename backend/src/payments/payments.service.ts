import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PayBillDto } from './dto/pay-bill.dto';
import type { User, PaymentType } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // Mock fetching pending bills
  async getPendingBills(userId: string) {
    // Generate some mock bills for the user
    return [
      {
        id: 'bill_1',
        type: 'WATER_BILL',
        amount: 850.50,
        dueDate: new Date(Date.now() + 86400000 * 5),
        description: 'Monthly Water Usage - Sector 4',
      },
      {
        id: 'bill_2',
        type: 'PROPERTY_TAX',
        amount: 15400.00,
        dueDate: new Date(Date.now() + 86400000 * 15),
        description: 'Annual Property Tax (2025-2026)',
      }
    ];
  }

  async payBill(dto: PayBillDto, user: User) {
    // Simulate payment processing and record it in database
    return this.prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        amount: dto.amount,
        type: dto.type,
        transactionId: dto.transactionId,
        status: 'COMPLETED',
        receiptUrl: `https://lumen-mock-s3.com/receipts/${dto.transactionId}.pdf`,
      }
    });
  }

  async getPaymentHistory(userId: string) {
    return this.prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
