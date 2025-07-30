import { Module } from '@nestjs/common';

import { RequestDetailsService }    from '@request-details/request-details.service';
import { RequestDetailsController } from '@request-details/request-details.controller';
import { SseModule }               from '@sse/sse.module';


@Module({
    controllers : [RequestDetailsController],
    providers   : [RequestDetailsService],
    imports     : [SseModule],
})
export class RequestDetailsModule {}
