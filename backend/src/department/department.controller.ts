import { Controller, Get, Patch, Post, Body, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { AllocateEngineerDto } from './dto/allocate-engineer.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@ApiTags('Department')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DEPARTMENT, Role.SUPERVISOR)
@Controller('api/v1/department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get department dashboard statistics (SLAs, engineers, complaints)' })
  async getDashboard() {
    return this.departmentService.getDashboard();
  }

  @Get('complaints')
  @ApiOperation({ summary: 'Get department complaint queue' })
  @ApiQuery({ name: 'category', required: false })
  async getComplaintsQueue(@Query('category') category?: string) {
    return this.departmentService.getComplaintsQueue(category);
  }

  @Get('escalations')
  @ApiOperation({ summary: 'Get escalated complaints (critical or SLA breached)' })
  async getEscalations() {
    return this.departmentService.getEscalations();
  }

  @Get('engineers')
  @ApiOperation({ summary: 'List all available engineers' })
  async getAvailableEngineers() {
    return this.departmentService.getAvailableEngineers();
  }

  @Post('assignments/:complaintId')
  @ApiOperation({ summary: 'Allocate an engineer to a complaint' })
  async allocateEngineer(
    @CurrentUser() user: User,
    @Param('complaintId') complaintId: string,
    @Body() dto: AllocateEngineerDto
  ) {
    return this.departmentService.allocateEngineer(complaintId, user.id, dto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Generate analytical performance reports' })
  async getReports() {
    return this.departmentService.getReports();
  }

  @Patch('zones')
  @ApiOperation({ summary: 'Update zones and ward configurations for the department' })
  async updateZones(
    @CurrentUser() user: User,
    @Body() dto: UpdateZoneDto
  ) {
    return this.departmentService.updateZones(user.id, dto);
  }
}
