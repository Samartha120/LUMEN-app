import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';
import type { User } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, params, user } = req;

    return next.handle().pipe(
      tap({
        next: (res) => {
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const currentUser = user as User;
            this.auditService
              .logAction(method, url, params?.id, currentUser?.id, {
                body: method !== 'DELETE' ? body : undefined,
              })
              .catch((err) =>
                this.logger.error('Failed to save audit log', err),
              );
          }
        },
      }),
    );
  }
}
