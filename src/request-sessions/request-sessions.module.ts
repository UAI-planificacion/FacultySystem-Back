import { Module } from '@nestjs/common';

import { RequestSessionsService }       from '@request-sessions/request-sessions.service';
import { RequestSessionsController }    from '@request-sessions/request-sessions.controller';
import { SseModule }                    from '@sse/sse.module';


@Module({
    controllers : [RequestSessionsController],
    providers   : [RequestSessionsService],
    imports     : [SseModule],
})
export class RequestSessionsModule {}
