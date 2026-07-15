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
  @ApiOperation({
    summary: 'Report a new complaint using pre-uploaded media URLs',
  })
  create(
    @Body() createComplaintDto: CreateComplaintDto,
    @CurrentUser() user: User,
  ) {
    return this.complaintsService.create(createComplaintDto, user);
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
