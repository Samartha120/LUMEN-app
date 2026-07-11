import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuthenticationModule } from './authentication/authentication.module';
import { CitizenModule } from './citizen/citizen.module';
import { EngineerModule } from './engineer/engineer.module';
import { DepartmentModule } from './department/department.module';
import { AdminModule } from './admin/admin.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { TimelineModule } from './timeline/timeline.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MapsModule } from './maps/maps.module';
import { StorageModule } from './storage/storage.module';
import { AiModule } from './ai/ai.module';
import { AuditModule } from './audit/audit.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // Max 100 requests per minute globally
    }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    AuthenticationModule,
    CitizenModule,
    EngineerModule,
    DepartmentModule,
    AdminModule,
    ComplaintsModule,
    AssignmentsModule,
    TimelineModule,
    NotificationsModule,
    AnalyticsModule,
    MapsModule,
    StorageModule,
    AiModule,
    AuditModule,
    CommonModule,
    DatabaseModule,
    HealthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
