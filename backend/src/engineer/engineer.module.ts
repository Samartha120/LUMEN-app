import { Module } from '@nestjs/common';
import { EngineerController } from './engineer.controller';
import { EngineerService } from './engineer.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EngineerController],
  providers: [EngineerService],
})
export class EngineerModule {}
