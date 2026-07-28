import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { NotificationProcessor } from './notification.processor';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lumen-super-secret-jwt-key',
    }),
  ],
  providers: [NotificationsService, NotificationProcessor, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
