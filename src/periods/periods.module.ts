import { Module } from '@nestjs/common';

import { PeriodsService }       from '@periods/periods.service';
import { PeriodsController }    from '@periods/periods.controller';


@Module({
    controllers : [PeriodsController],
    providers   : [PeriodsService],
})
export class PeriodsModule {}
