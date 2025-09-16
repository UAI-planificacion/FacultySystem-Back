import { Module } from '@nestjs/common';

import { DaysService }      from '@days/days.service';
import { DaysController }   from '@days/days.controller';


@Module({
    controllers: [DaysController],
    providers: [DaysService],
})
export class DaysModule {}
