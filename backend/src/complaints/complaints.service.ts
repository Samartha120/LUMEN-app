import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { SyncComplaintsDto } from './dto/sync-complaints.dto';
import type { User, Complaint } from '@prisma/client';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.complaint.update({
      where: { id },
      data: updateComplaintDto,
    });
  }
}
