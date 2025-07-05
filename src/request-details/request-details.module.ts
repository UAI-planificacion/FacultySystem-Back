import { Module } from '@nestjs/common';

import { RequestDetailsService }    from '@request-details/request-details.service';
import { RequestDetailsController } from '@request-details/request-details.controller';

@Module({
    controllers : [RequestDetailsController],
    providers   : [RequestDetailsService],
})
export class RequestDetailsModule {}
