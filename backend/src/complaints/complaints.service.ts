import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { SyncComplaintsDto } from './dto/sync-complaints.dto';
import type { User, Complaint } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ComplaintsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
    private aiService: AiService
  ) {}

  async create(createComplaintDto: CreateComplaintDto, user: User | null) {
    const complaint = await this.prisma.complaint.create({
      data: {
        trackingId: `CMP-${Date.now()}`,
        title: createComplaintDto.title,
        description: createComplaintDto.description,
        category: createComplaintDto.category,
        priority: createComplaintDto.priority,
        latitude: createComplaintDto.latitude,
        longitude: createComplaintDto.longitude,
        // @ts-ignore: IDE cache may not have picked up the new Prisma schema fields yet
        imageUrl: createComplaintDto.imageUrl,
        // @ts-ignore
        videoUrl: createComplaintDto.videoUrl,
        isAnonymous: createComplaintDto.isAnonymous || false,
        reporterId: user ? user.id : undefined,
      },
    });

    if (createComplaintDto.latitude && createComplaintDto.longitude) {
      await this.prisma.$executeRaw`
        UPDATE complaints
        SET location = ST_SetSRID(ST_MakePoint(${createComplaintDto.longitude}, ${createComplaintDto.latitude}), 4326)
        WHERE id = ${complaint.id};
      `;
    }

    // Phase 20: Queue background jobs for AI prediction
    // @ts-ignore
    if (createComplaintDto.imageUrl) {
      // @ts-ignore
      await this.aiService.queueImagePrediction(complaint.id, createComplaintDto.imageUrl);
      // @ts-ignore
      await this.aiService.queueYoloPrediction(complaint.id, createComplaintDto.imageUrl);
    } else if (createComplaintDto.videoUrl) {
      // @ts-ignore
      await this.aiService.queueVideoPrediction(complaint.id, createComplaintDto.videoUrl);
    }

    return this.prisma.complaint.findUnique({ where: { id: complaint.id } });
  }

  async sync(syncDto: SyncComplaintsDto, user: User | null) {
    const results: Complaint[] = [];
    // Using a transaction to ensure atomic batch sync
    await this.prisma.$transaction(async (tx) => {
      for (const dto of syncDto.complaints) {
        const complaint = await tx.complaint.create({
          data: {
            trackingId: `CMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

        if (dto.latitude && dto.longitude) {
          await tx.$executeRaw`
            UPDATE complaints
            SET location = ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)
            WHERE id = ${complaint.id};
          `;
        }
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
      } else if (dto.videoUrl) { // @ts-ignore
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
      ST_Distance(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)) AS distance
      FROM complaints
      WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), ${radiusMeters})
      ORDER BY distance ASC;
    `;
    return complaints;
  }

  async findOne(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: { reporter: { select: { fullName: true } } },
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
