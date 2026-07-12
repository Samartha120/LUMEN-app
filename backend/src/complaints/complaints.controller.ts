import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 3))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Report a new complaint with up to 3 photos' })
  create(
    @Body() createComplaintDto: CreateComplaintDto,
    @CurrentUser() user: User,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Note: DTO values from multipart/form-data come as strings.
    // They may need casting/transformation (e.g., latitude to number), which ValidationPipe with transform: true handles.
    return this.complaintsService.create(createComplaintDto, user, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all complaints' })
  findAll() {
    return this.complaintsService.findAll();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby complaints using PostGIS' })
  findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number,
  ) {
    return this.complaintsService.findNearby(
      lat,
      lng,
      radius ? Number(radius) : 5,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint details by ID' })
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a complaint' })
  update(
    @Param('id') id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
  ) {
    return this.complaintsService.update(id, updateComplaintDto);
  }
}
