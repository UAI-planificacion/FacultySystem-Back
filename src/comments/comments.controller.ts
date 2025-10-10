import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';

import { CommentsService }          from '@comments/comments.service';
import { CreateCommentDto }         from '@comments/dto/create-comment.dto';
import { UpdateCommentDto }         from '@comments/dto/update-comment.dto';
import { CommentValidationPipe }    from '@comments/pipes/comment-validation.pipe';


@Controller( 'comments' )
export class CommentsController {

    constructor(
        private readonly commentService: CommentsService
    ) {}


    @Post()
    @UsePipes( CommentValidationPipe )
    create(
        @Body() createCommentDto: CreateCommentDto
    ) {
        return this.commentService.create( createCommentDto );
    }


    @Get( 'request-session/:id' )
    findAllByRequestSessionId(
        @Param( 'id' ) id: string,
    ) {
        return this.commentService.findAllByRequestSessionId( id );
    }


    @Get( 'planning-change/:id' )
    findAllByPlanningChangeId(
        @Param( 'id' ) id: string
    ) {
        return this.commentService.findAllByPlanningChangeId( id );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id: string,
        @Body() updateCommentDto: UpdateCommentDto
    ) {
        return this.commentService.update( id, updateCommentDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.commentService.remove( id );
    }

}
