import { Module } from '@nestjs/common';

import { CommentsService }      from '@comments/comments.service';
import { CommentsController }   from '@comments/comments.controller';


@Module({
    controllers : [ CommentsController ],
    providers   : [ CommentsService ],
})
export class CommentsModule {}
