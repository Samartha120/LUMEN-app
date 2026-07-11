import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.DEPARTMENT, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Assign a complaint to an engineer' })
  create(@Body() createAssignmentDto: CreateAssignmentDto, @CurrentUser() user: User) {
    return this.assignmentsService.create(createAssignmentDto, user);
  }

  @Get('my-tasks')
  @Roles(Role.ENGINEER)
  @ApiOperation({ summary: 'Get assignments for the logged-in engineer' })
  findMyTasks(@CurrentUser() user: User) {
    return this.assignmentsService.findByEngineer(user.id);
  }

  @Patch(':id/status')
  @Roles(Role.ENGINEER, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Update assignment status (e.g., IN_PROGRESS, COMPLETED)' })
  updateStatus(
    @Param('id') id: string, 
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @CurrentUser() user: User
  ) {
    return this.assignmentsService.updateStatus(id, updateAssignmentDto, user);
  }
}
