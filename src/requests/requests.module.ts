import { Module } from '@nestjs/common';

import { RequestsService }      from '@requests/requests.service';
import { RequestsController }   from '@requests/requests.controller';
import { SseModule }            from '@sse/sse.module';

@Module({
    controllers : [RequestsController],
    providers   : [RequestsService],
    imports     : [SseModule],
})
export class RequestsModule {}
