import { Module } from '@nestjs/common';

import { PlanningChangeService }    from '@planning-change/planning-change.service';
import { PlanningChangeController } from '@planning-change/planning-change.controller';
import { SseModule }                from '@sse/sse.module';


@Module({
    controllers : [PlanningChangeController],
    providers   : [PlanningChangeService],
    imports     : [SseModule],
})
export class PlanningChangeModule {}
