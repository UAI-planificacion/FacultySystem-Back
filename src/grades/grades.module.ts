import { Module } from '@nestjs/common';

import { GradesService }    from '@grades/grades.service';
import { GradesController } from '@grades/grades.controller';


@Module({
    controllers : [GradesController],
    providers   : [GradesService],
})
export class GradesModule {}
