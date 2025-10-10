import { Module } from '@nestjs/common';
import { PlanningChangeService } from './planning-change.service';
import { PlanningChangeController } from './planning-change.controller';

@Module({
  controllers: [PlanningChangeController],
  providers: [PlanningChangeService],
})
export class PlanningChangeModule {}
