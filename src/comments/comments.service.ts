import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { CreateCommentDto } from '@comments/dto/create-comment.dto';
import { UpdateCommentDto } from '@comments/dto/update-comment.dto';

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
            return comment;
        } catch (error) {
            throw new Error('Failed to create comment');
        }
    }

    async findAllByRequestId( requestId: string ) {
        return await this.comment.findMany({
            where: {
                requestId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findAllByRequestDetailId( requestDetailId: string ) {
        return await this.comment.findMany({
            where: {
                requestDetailId,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findOne( id: string ) {
        return await this.comment.findUnique({
            where: {
                id
            }
        });
    }

    async update( id: string, updateCommentDto: UpdateCommentDto ) {
        try {
            const comment = await this.comment.update({
                where: {
                    id
                },
                data: updateCommentDto
            });
            return comment;
        } catch (error) {
            throw new Error('Failed to update comment');
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
        } catch (error) {
            throw new Error('Failed to remove comment');
        }
    }

}
