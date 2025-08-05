import { Module } from '@nestjs/common';

import { SseController }    from '@sse/sse.controller';
import { SseService }       from '@sse/sse.service';


@Module({
    controllers : [ SseController ],
    providers   : [ SseService ],
    exports     : [ SseService ],
})
export class SseModule {}
