import { Module } from '@nestjs/common';

import { RequestSessionsService }       from '@request-sessions/request-sessions.service';
import { RequestSessionsController }    from '@request-sessions/request-sessions.controller';


@Module({
    controllers : [RequestSessionsController],
    providers   : [RequestSessionsService],
})
export class RequestSessionsModule {}
