import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';

import { Prisma, PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@config/prisma-catch';
import { CreateRequestDto } from '@requests/dto/create-request.dto';
import { UpdateRequestDto } from '@requests/dto/update-request.dto';
import { SseService }       from '@sse/sse.service';
import { EnumAction, Type } from '@sse/sse.model';


@Injectable()
export class RequestsService extends PrismaClient implements OnModuleInit {

    constructor(
		private readonly sseService: SseService,
    ) {
        super();
    }


    onModuleInit() {
        this.$connect();
    }


    // #requestMap = ( request ) => ({
    //     id              : request.id,
    //     title           : request.title,
    //     status          : request.status,
    //     isConsecutive   : request.isConsecutive,
    //     description     : request.description,
    //     createdAt       : request.createdAt,
    //     updatedAt       : request.updatedAt,
    //     staffCreate     : request.staffCreate,
    //     staffUpdate     : request.staffUpdate,
    //     offer           : request.offer,
    //     totalDetails    : request._count.details,
    //     facultyId       : request.staffCreate.facultyId
    // });


    // #selectRequest = {
    //     id              : true,
    //     title           : true,
    //     status          : true,
    //     isConsecutive   : true,
    //     description     : true,
    //     createdAt       : true,
    //     updatedAt       : true,
    //     staffCreate     : {
    //         select: {
    //             id          : true,
    //             name        : true,
    //             email       : true,
    //             role        : true,
    //             facultyId   : true
    //         }
    //     },
    //     staffUpdate     : {
    //         select: {
    //             id      : true,
    //             name    : true,
    //             email   : true,
    //             role    : true
    //         }
    //     },
    //     offer : {
    //         select : {
    //             id              : true,
    //             workshop        : true,
    //             lecture         : true,
    //             tutoringSession : true,
    //             laboratory      : true,
    //             spaceType       : true,
    //             costCenterId    : true,
    //             isEnglish       : true,
    //             building        : true,
    //             startDate       : true,
    //             endDate         : true,
    //             spaceSize : {
    //                 select : {
    //                     id      : true,
    //                     detail  : true
    //                 }
    //             },
    //             subject         : {
    //                 select : {
    //                     id      : true,
    //                     name    : true,
    //                 }
    //             },
    //             period : {
    //                 select : {
    //                     id      : true,
    //                     name    : true
    //                 }
    //             }
    //         }
    //     },
    //     _count: {
    //         select: {
    //             details: true
    //         }
    //     }
    // }


    // async create(
    //     createRequestDto    : CreateRequestDto,
    //     origin              : string | undefined
    // ) {
    //     try {
    //         const request       = await this.request.create({ data: createRequestDto });
    //         const requestData   = await this.findOne( request.id );

    //         this.sseService.emitEvent({
    //             message : requestData,
    //             action  : EnumAction.CREATE,
    //             type    : Type.REQUEST,
    //             origin
    //         });

    //         return requestData;
    //     } catch ( error ) {
    //         throw PrismaException.catch( error, 'Failed to create request' );
    //     }
    // }


    // async findAll( facultyId: string ) {
    //     const requests = await this.request.findMany({
    //         select  : this.#selectRequest,
    //         where   : {
    //             offer : {
    //                 subject : {
    //                     facultyId
    //                 }
    //             }
    //         }
    //     });

    //     return requests.map(( request ) => this.#requestMap( request ));
    // }


    // async findOne( id: string ) {
    //     const request = await this.request.findUnique({
    //         select  : this.#selectRequest,
    //         where   : { id },
    //     });

    //     if ( !request ) {
    //         throw new NotFoundException( 'Request not found' );
    //     }

    //     return this.#requestMap( request );
    // }


    // async update(
    //     id                  : string,
    //     updateRequestDto    : UpdateRequestDto,
    //     origin              : string | undefined
    // ) {
    //     const data: Prisma.RequestUpdateInput = { ...updateRequestDto };

    //     if ( updateRequestDto.offerId !== undefined ) {
    //         delete ( data as any ).offerId; 

    //         data.offer = {
    //             connect: { id: updateRequestDto.offerId }
    //         };
    //     }

    //     if ( updateRequestDto.staffUpdateId ) {
    //         delete ( data as any ).staffUpdateId;

    //         data.staffUpdate = {
    //             connect: { id: updateRequestDto.staffUpdateId }
    //         };
    //     } 

    //     try {
    //         const requestUpdated = await this.request.update({
    //             where: { id },
    //             data
    //         });

    //         const requestData = await this.findOne( requestUpdated.id );

    //         this.sseService.emitEvent({
    //             message : requestData,
    //             action  : EnumAction.UPDATE,
    //             type    : Type.REQUEST,
    //             origin
    //         });

    //         return requestData;
    //     } catch ( error ) {
    //         throw PrismaException.catch( error, 'Failed to update request' );
    //     }
    // }


    // async remove( id: string, origin: string | undefined ) {
    //     try {
    //         const requestData = await this.findOne( id );
    //         await this.request.delete({ where: { id } });

    //         this.sseService.emitEvent({
    //             message : requestData,
    //             action  : EnumAction.DELETE,
    //             type    : Type.REQUEST,
    //             origin
    //         });

    //         return requestData;
    //     } catch ( error ) {
    //         throw PrismaException.catch( error, 'Failed to delete request' );
    //     }
    // }

}
