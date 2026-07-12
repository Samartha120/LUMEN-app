import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EngineerService } from './engineer.service';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';
import { UpdateEngineerStatusDto } from './dto/update-engineer-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';

@ApiTags('Engineer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ENGINEER)
@Controller('api/v1/engineer')
export class EngineerController {
  constructor(private readonly engineerService: EngineerService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get engineer dashboard statistics' })
  async getDashboard(@CurrentUser() user: User) {
    return this.engineerService.getDashboard(user.id);
  }

  @Get('assignments/current')
  @ApiOperation({ summary: 'Get current pending or in-progress assignments' })
  async getCurrentAssignments(@CurrentUser() user: User) {
    return this.engineerService.getCurrentAssignments(user.id);
  }

  @Get('assignments/today')
  @ApiOperation({ summary: 'Get assignments dispatched today' })
  async getTodayAssignments(@CurrentUser() user: User) {
    return this.engineerService.getTodayAssignments(user.id);
  }

  @Get('assignments/history')
  @ApiOperation({ summary: 'Get completed or failed assignments history' })
  async getAssignmentHistory(@CurrentUser() user: User) {
    return this.engineerService.getAssignmentHistory(user.id);
  }

  @Patch('assignments/:id')
  @ApiOperation({
    summary: 'Update an assignment (add notes, photo, change status)',
  })
  async updateAssignmentStatus(
    @CurrentUser() user: User,
    @Param('id') assignmentId: string,
    @Body() updateDto: UpdateAssignmentStatusDto,
  ) {
    return this.engineerService.updateAssignmentStatus(
      user.id,
      assignmentId,
      updateDto,
    );
  }

  @Patch('status')
  @ApiOperation({
    summary: 'Update engineer shift status, location, and availability',
  })
  async updateEngineerStatus(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateEngineerStatusDto,
  ) {
    return this.engineerService.updateEngineerStatus(user.id, updateDto);
  }
}
