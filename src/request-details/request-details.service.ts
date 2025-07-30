import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';

import { CreateRequestDetailDto }   from '@request-details/dto/create-request-detail.dto';
import { UpdateRequestDetailDto }   from '@request-details/dto/update-request-detail.dto';
import { PrismaClient }             from 'generated/prisma';

import { PrismaException }  from '@config/prisma-catch';
import { SseService }       from '@sse/sse.service';
import { EnumAction, Type } from '@sse/sse.model';


@Injectable()
export class RequestDetailsService extends PrismaClient implements OnModuleInit {

    constructor(
		private readonly sseService: SseService,
    ) {
        super();
    }


    onModuleInit() {
        this.$connect();
    }


    #getIsPriority( requestDetail :CreateRequestDetailDto | UpdateRequestDetailDto ) {
        return !!requestDetail.professorId  &&
            !!requestDetail.moduleId        &&
            !!requestDetail.spaceId         &&
            requestDetail.days.length > 0;
    }


    async create( createRequestDetailDto: CreateRequestDetailDto ) {
        const isPriority = this.#getIsPriority( createRequestDetailDto );

        try {
            const requestDetail = await this.requestDetail.create({ data: {
                ...createRequestDetailDto,
                isPriority
            }});

            this.sseService.emitEvent({
                message : requestDetail,
                action  : EnumAction.CREATE,
                type    : Type.DETAIL
            });

            return requestDetail;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create request detail' );
        }
    }


    async findAll( requestId: string ) {
        return await this.requestDetail.findMany({
            select: {
                id              : true,
                requestId       : true,
                minimum         : true,
                maximum         : true,
                spaceType       : true,
                spaceSize       : true,
                costCenterId    : true,
                inAfternoon     : true,
                building        : true,
                description     : true,
                moduleId        : true,
                days            : true,
                spaceId         : true,
                isPriority      : true,
                level           : true,
                createdAt       : true,
                updatedAt       : true,
                professorId     : true,
                staffUpdate: {
                    select: {
                        id      : true,
                        name    : true,
                        email   : true,
                    }
                },
                staffCreate: {
                    select: {
                        id      : true,
                        name    : true,
                        email   : true,
                    }
                },
            },
            where: { requestId }
        });
    }


    async findOne( id: string ) {
        const requestDetail = await this.requestDetail.findUnique({ where: { id }});

        if ( !requestDetail ) {
            throw new NotFoundException( 'Request detail not found' );
        }

        return requestDetail;
    }


    async update( id: string, updateRequestDetailDto: UpdateRequestDetailDto ) {
        const isPriority = this.#getIsPriority( updateRequestDetailDto );

        try {
            const requestDetail = await this.requestDetail.update({
                where: { id },
                data: {
                    ...updateRequestDetailDto,
                    isPriority
                }
            });

            this.sseService.emitEvent({
                message : requestDetail,
                action  : EnumAction.UPDATE,
                type    : Type.DETAIL
            });

            return requestDetail
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update request detail' );
        }
    }


    async remove( id: string ) {
        try {
            const requestDetail = await this.requestDetail.delete({ where: { id }});

            this.sseService.emitEvent({
                message : requestDetail,
                action  : EnumAction.DELETE,
                type    : Type.DETAIL
            });

            return requestDetail;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete request detail' );
        }
    }

}
