import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import type { User, Complaint } from '@prisma/client';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ComplaintsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(
    createComplaintDto: CreateComplaintDto,
    user: User,
    files?: Express.Multer.File[],
  ) {
    let uploadedUrls: string[] = [];

    if (files && files.length > 0) {
      // Upload all files concurrently
      uploadedUrls = await Promise.all(
        files.map((file) => this.storageService.uploadFile(file)),
      );
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        trackingId: `CMP-${Date.now()}`,
        title: createComplaintDto.title,
        description: createComplaintDto.description,
        category: createComplaintDto.category,
        priority: createComplaintDto.priority,
        latitude: createComplaintDto.latitude,
        longitude: createComplaintDto.longitude,
        reporterId: user.id,
        photos: uploadedUrls,
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

  findAll() {
    return this.prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { firstName: true, lastName: true } } },
    });
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    const radiusMeters = radiusKm * 1000;
    const complaints = await this.prisma.$queryRaw<Complaint[]>`
      SELECT id, title, description, category, priority, status, latitude, longitude, photos,
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
      include: { reporter: { select: { firstName: true, lastName: true } } },
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
