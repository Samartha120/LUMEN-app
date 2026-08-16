import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { SyncComplaintsDto } from './dto/sync-complaints.dto';
import type { User, Complaint } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { AiService } from '../ai/ai.service';
import { StorageService } from '../common/storage/storage.service';

import { SyncService } from '../sync/sync.service';

@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
    private aiService: AiService,
    private storageService: StorageService,
    private syncService: SyncService,
  ) {}

  private async getNextTrackingId(tx?: any): Promise<string> {
    const prisma = tx || this.prisma;
    const lastComplaint = await prisma.complaint.findFirst({
      where: {
        trackingId: {
          startsWith: 'CMP-',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let nextNumber = 10245;
    if (lastComplaint) {
      const parts = lastComplaint.trackingId.split('-');
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num < 100000000) {
        nextNumber = num + 1;
      } else {
        const allComplaints = await prisma.complaint.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        for (const c of allComplaints) {
          const p = c.trackingId.split('-');
          const n = parseInt(p[1], 10);
          if (!isNaN(n) && n < 100000000) {
            nextNumber = n + 1;
            break;
          }
        }
      }
    }
    return `CMP-${nextNumber}`;
  }

  async create(createComplaintDto: CreateComplaintDto, user: User) {
    if (!createComplaintDto.imageUrl) {
      throw new BadRequestException(
        'Image URL is strictly required to file a complaint',
      );
    }

    if (
      createComplaintDto.latitude === undefined ||
      createComplaintDto.longitude === undefined
    ) {
      throw new BadRequestException(
        'GPS coordinates (latitude and longitude) are strictly required',
      );
    }

    if (createComplaintDto.latitude < -90 || createComplaintDto.latitude > 90) {
      throw new BadRequestException(
        'Latitude must be between -90 and 90 degrees',
      );
    }

    if (
      createComplaintDto.longitude < -180 ||
      createComplaintDto.longitude > 180
    ) {
      throw new BadRequestException(
        'Longitude must be between -180 and 180 degrees',
      );
    }

    // Phase 1: Synchronous AI Image Validation (Strict Enforcement)
    let aiValidationResult: any = null;
    try {
      let imageUrlForAi = createComplaintDto.imageUrl;
      if (imageUrlForAi.includes('.amazonaws.com/')) {
        // Parse out the S3 object key (everything after .amazonaws.com/)
        const key = imageUrlForAi.split('.amazonaws.com/')[1];
        try {
          imageUrlForAi = await this.storageService.getSignedUrl(key);
        } catch (err) {
          this.logger.warn(`Failed to sign image URL for AI validation: ${err.message}`);
        }
      }

      // @ts-ignore
      aiValidationResult = await this.aiService.validateComplaintImageSync(
        imageUrlForAi,
        createComplaintDto.category,
      );
    } catch (e: any) {
      // Catch validation errors (blur, confidence, category mismatch) and block submission
      throw new BadRequestException(e.message || 'Image validation failed');
    }

    // Phase 2: Geographic Duplicate Detection (PostGIS logic equivalent)
    // 20 meters = 0.02 km
    const nearby = await this.findNearby(
      createComplaintDto.latitude,
      createComplaintDto.longitude,
      0.02,
    );
    const hasDuplicate = nearby.some(
      (c: any) => c.category === createComplaintDto.category,
    );
    if (hasDuplicate) {
      throw new BadRequestException(
        'A similar issue has already been reported at this exact location.',
      );
    }

    // Phase 3: Create Complaint in PostgreSQL
    const complaint = await this.prisma.complaint.create({
      data: {
        trackingId: await this.getNextTrackingId(),
        title: createComplaintDto.title,
        description: createComplaintDto.description,
        category: createComplaintDto.category,
        priority: createComplaintDto.priority,
        latitude: createComplaintDto.latitude,
        longitude: createComplaintDto.longitude,
        // @ts-ignore: IDE cache may not have picked up the new Prisma schema fields yet
        accuracy: createComplaintDto.accuracy,
        // @ts-ignore
        capturedAt: createComplaintDto.capturedAt
          ? new Date(createComplaintDto.capturedAt)
          : undefined,
        // @ts-ignore
        imageUrl: createComplaintDto.imageUrl,
        // @ts-ignore
        videoUrl: createComplaintDto.videoUrl,
        isAnonymous: createComplaintDto.isAnonymous || false,
        reporterId: user.id,
      },
    });

    this.logger.log(
      `Complaint created in PostgreSQL! ID: ${complaint.id}, TrackingID: ${complaint.trackingId}`,
    );

    // Phase 4: Save AI Metadata synchronously (instead of queueing for YOLO again)
    if (aiValidationResult) {
      await this.prisma.aiPrediction.create({
        data: {
          complaintId: complaint.id,
          damageClass: aiValidationResult.damageClass,
          confidenceScore: aiValidationResult.confidenceScore,
          boundingBoxes: aiValidationResult.boundingBoxes,
          metadata: aiValidationResult.metadata,
          status: 'COMPLETED',
        },
      });
    }

    const finalComplaint = await this.prisma.complaint.findUnique({
      where: { id: complaint.id },
      include: { aiPrediction: true },
    });

    if (finalComplaint) {
      this.syncService.syncComplaintToWebDashboard(finalComplaint);
    }

    return finalComplaint;
  }

  async sync(syncDto: SyncComplaintsDto, user: User | null) {
    const results: Complaint[] = [];
    // Using a transaction to ensure atomic batch sync
    await this.prisma.$transaction(async (tx) => {
      const startingRef = await this.getNextTrackingId(tx);
      let nextNumber = parseInt(startingRef.split('-')[1], 10);

      for (const dto of syncDto.complaints) {
        const trackingId = `CMP-${nextNumber++}`;
        const complaint = await tx.complaint.create({
          data: {
            trackingId,
            title: dto.title,
            description: dto.description,
            category: dto.category,
            priority: dto.priority,
            latitude: dto.latitude,
            longitude: dto.longitude,
            // @ts-ignore
            imageUrl: dto.imageUrl,
            // @ts-ignore
            videoUrl: dto.videoUrl,
            isAnonymous: dto.isAnonymous || false,
            reporterId: user ? user.id : undefined,
          },
        });

        // Removed PostGIS ST_SetSRID update
        results.push(complaint);
      }
    });

    for (let i = 0; i < results.length; i++) {
      const complaint = results[i];
      const dto = syncDto.complaints[i];
      // @ts-ignore
      if (dto.imageUrl) {
        // @ts-ignore
        await this.aiService.queueImagePrediction(complaint.id, dto.imageUrl);
        // @ts-ignore
        await this.aiService.queueYoloPrediction(complaint.id, dto.imageUrl);
      } else if (dto.videoUrl) {
        // @ts-ignore
        await this.aiService.queueVideoPrediction(complaint.id, dto.videoUrl);
      }
    }

    return { synced: results.length, complaints: results };
  }

  findAll() {
    return this.prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { fullName: true } } },
    });
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    const radiusMeters = radiusKm * 1000;
    const complaints = await this.prisma.$queryRaw<Complaint[]>`
      SELECT id, title, description, category, priority, status, latitude, longitude, "imageUrl", "videoUrl",
      (6371000 * acos(
        least(1.0, greatest(-1.0, 
          cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + 
          sin(radians(${lat})) * sin(radians(latitude))
        ))
      )) AS distance
      FROM complaints
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      AND (6371000 * acos(
        least(1.0, greatest(-1.0, 
          cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + 
          sin(radians(${lat})) * sin(radians(latitude))
        ))
      )) <= ${radiusMeters}
      ORDER BY distance ASC;
    `;
    return complaints;
  }

  async findOne(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        reporter: { select: { fullName: true } },
        aiPrediction: true,
        timeline: true,
      },
    });
    if (!complaint)
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    return complaint;
  }

  async update(id: string, updateComplaintDto: UpdateComplaintDto) {
    const updated = await this.prisma.complaint.update({
      where: { id },
      data: updateComplaintDto,
    });

    // Broadcast the update
    this.notificationsGateway.emitComplaintUpdate(id, updated);

    return updated;
  }
}
