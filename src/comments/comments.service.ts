import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

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
                data: createCommentDto
            });

            return this.findOne( comment.id );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create comment' );
        }
    }

    #selectComment = {
        id          : true,
        content     : true,
        adminEmail  : true,
        adminName   : true,
        createdAt   : true,
        updatedAt   : true,
        staff       : {
            select: {
                name    : true,
                email   : true
            }
        }
    }

    async findAllByRequestId( requestId: string ) {
        return await this.comment.findMany({
            select  : this.#selectComment,
            where   : {
                requestId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findAllByRequestDetailId( requestDetailId: string ) {
        return await this.comment.findMany({
            select  : this.#selectComment,
            where   : {
                requestDetailId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findOne( id: string ) {
        const comment = await this.comment.findUnique({
            select : {
                ...this.#selectComment,
                requestId       : true,
                requestDetailId : true
            },
            where: {
                id
            }
        });

        if ( !comment ) {
            throw new NotFoundException( 'Comment not found' );
        }

        return comment;
    }

    async update( id: string, updateCommentDto: UpdateCommentDto ) {
        try {
            const comment = await this.comment.update({
                where: {
                    id
                },
                data: updateCommentDto
            });

            return this.findOne( comment.id );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update comment' );
        }
    }

    async remove( id: string ) {
        try {
            const comment = await this.comment.delete({
                where: {
                    id
                }
            });

            return comment;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to remove comment' );
        }
    }

}
