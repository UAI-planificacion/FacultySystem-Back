import { Injectable, OnModuleInit, UnprocessableEntityException } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { CreateCommentDto } from '@comments/dto/create-comment.dto';
import { UpdateCommentDto } from '@comments/dto/update-comment.dto';
import { PrismaException }  from '@config/prisma-catch';


@Injectable()
export class CommentsService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
        this.$connect();
    }


    async create( createCommentDto: CreateCommentDto ) {
        try {
            const comment = await this.comment.create({
                data: createCommentDto,
                select: this.#selectComment
            });

            return comment;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create comment' );
        }
    }


    #selectComment = {
        id          : true,
        content     : true,
        createdAt   : true,
        updatedAt   : true,
        staff       : {
            select: {
                name    : true,
                email   : true,
                role    : true,
            }
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


    async update( id: string, updateCommentDto: UpdateCommentDto ) {
        try {
            const comment = await this.comment.update({
                where   : { id },
                data    : updateCommentDto,
                select  : this.#selectComment
            });

            return comment;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update comment' );
        }
    }


    async remove( id: string ) {
        try {
            const comment = await this.comment.delete({
                where: { id }
            });

            return comment;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to remove comment' );
        }
    }

}
