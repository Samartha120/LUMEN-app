import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { SyncComplaintsDto } from './dto/sync-complaints.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
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
@ApiTags('Complaints')
@ApiBearerAuth()
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Report a new complaint using pre-uploaded media URLs',
  })
  create(
    @Body() createComplaintDto: CreateComplaintDto,
    @CurrentUser() user: User | null,
  ) {
    return this.complaintsService.create(createComplaintDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  @ApiOperation({
    summary: 'Synchronize an array of complaints created while offline',
  })
  sync(
    @Body() syncDto: SyncComplaintsDto,
    @CurrentUser() user: User,
  ) {
    return this.complaintsService.sync(syncDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all complaints' })
  findAll() {
    return this.complaintsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get complaint details by ID' })
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a complaint' })
  update(
    @Param('id') id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
  ) {
    return this.complaintsService.update(id, updateComplaintDto);
  }
}
