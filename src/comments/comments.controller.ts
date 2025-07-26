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

    @Get( 'request/:id' )
    findAllByRequestId(
        @Param( 'id' ) id: string,
    ) {
        return this.commentService.findAllByRequestId( id );
    }


    @Get( 'request-detail/:id' )
    findAllByRequestDetailId(
        @Param( 'id' ) id: string
    ) {
        return this.commentService.findAllByRequestDetailId( id );
    }

    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.commentService.findOne( id );
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
