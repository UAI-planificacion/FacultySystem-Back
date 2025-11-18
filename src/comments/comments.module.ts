import { Module } from '@nestjs/common';

import { CommentsService }      from '@comments/comments.service';
import { CommentsController }   from '@comments/comments.controller';
import { SseModule }            from '@sse/sse.module';


@Module({
    controllers : [ CommentsController ],
    providers   : [ CommentsService ],
    imports     : [ SseModule ]
})
export class CommentsModule {}
