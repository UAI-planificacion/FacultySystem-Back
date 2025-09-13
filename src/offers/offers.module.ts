import { Module } from '@nestjs/common';

import { OffersService }    from '@offers/offers.service';
import { OffersController } from '@offers/offers.controller';


@Module({
    controllers : [OffersController],
    providers   : [OffersService],
})
export class OffersModule {}
