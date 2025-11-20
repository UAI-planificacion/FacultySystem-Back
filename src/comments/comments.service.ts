import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { CreateCommentDto } from '@comments/dto/create-comment.dto';
import { UpdateCommentDto } from '@comments/dto/update-comment.dto';
import { PrismaException }  from '@config/prisma-catch';
import { SseService }       from '@sse/sse.service';
import { EnumAction, Type } from '@sse/sse.model';


@Injectable()
export class CommentsService extends PrismaClient implements OnModuleInit {

    constructor(
        private readonly sseService: SseService,
    ) {
        super();
    }

    onModuleInit() {
        this.$connect();
    }


    #selectComment = {
        id                  : true,
        content             : true,
        createdAt           : true,
        updatedAt           : true,
        requestSessionId    : true,
        planningChangeId    : true,
        staff               : {
            select: {
                name    : true,
                email   : true,
                role    : true,
            }
        }
    }


    async create( createCommentDto: CreateCommentDto, origin: string | undefined ) {
        try {
            const comment = await this.comment.create({
                data: createCommentDto,
                select: this.#selectComment
            });

            this.sseService.emitEvent({
                message : comment,
                action  : EnumAction.CREATE,
                type    : Type.COMMENT,
                origin
            });

            return comment;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create comment' );
        }
    }


    async findAllByRequestSessionId( requestSessionId: string ) {
        return await this.comment.findMany({
            select  : this.#selectComment,
            where   : {
                requestSessionId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }


    async findAllByPlanningChangeId( planningChangeId: string ) {
        return await this.comment.findMany({
            select  : this.#selectComment,
            where   : {
                planningChangeId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }


    async update(
        id: string,
        updateCommentDto: UpdateCommentDto,
        origin: string | undefined
    ) {
        try {
            const comment = await this.comment.update({
                where   : { id },
                data    : updateCommentDto,
                select  : this.#selectComment
            });

            this.sseService.emitEvent({
                message : comment,
                action  : EnumAction.UPDATE,
                type    : Type.COMMENT,
                origin
            });

            return comment;
        } catch ( error ) {
            console.log('🚀 ~ file: comments.service.ts:107 ~ error:', error)
            throw PrismaException.catch( error, 'Failed to update comment' );
        }
    }


    async remove( id: string, origin: string | undefined ) {
        try {
            const comment = await this.comment.delete({
                where: { id }
            });

            this.sseService.emitEvent({
                message : comment,
                action  : EnumAction.DELETE,
                type    : Type.COMMENT,
                origin
            });

            return comment;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to remove comment' );
        }
    }

}
