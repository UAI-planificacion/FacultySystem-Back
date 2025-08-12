import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { CreateRequestDetailDto }   from '@request-details/dto/create-request-detail.dto';
import { UpdateRequestDetailDto }   from '@request-details/dto/update-request-detail.dto';
import { PrismaException }          from '@config/prisma-catch';
import { SseService }               from '@sse/sse.service';
import { EnumAction, Type }         from '@sse/sse.model';


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


    #getIsPriority( requestDetail: CreateRequestDetailDto | UpdateRequestDetailDto ) {
        return !!requestDetail.professorId;
        // &&
            // requestDetail.moduleDays?.length > 0;
    }


    /**
     * Compare existing modules with new modules to determine if changes are needed
     * @param existingModules - Current modules from database
     * @param newModules - New modules from update request
     * @returns true if modules are different and need to be updated
     */
    #areModulesDifferent( 
        existingModules : { day: string, moduleId: string }[], 
        newModules      : { day: string, moduleId: string }[] 
    ): boolean {
        // If lengths are different, modules have changed
        if ( existingModules.length !== newModules.length ) {
            return true;
        }

        // Sort both arrays to ensure consistent comparison
        const sortedExisting = existingModules
            .map( m => ({ day: m.day, moduleId: m.moduleId }) )
            .sort( ( a, b ) => a.day.localeCompare( b.day ) || a.moduleId.localeCompare( b.moduleId ) );

        const sortedNew = newModules
            .map( m => ({ day: m.day, moduleId: m.moduleId }) )
            .sort( ( a, b ) => a.day.localeCompare( b.day ) || a.moduleId.localeCompare( b.moduleId ) );

        // Compare each module
        for ( let i = 0; i < sortedExisting.length; i++ ) {
            if ( 
                sortedExisting[i].day !== sortedNew[i].day || 
                sortedExisting[i].moduleId !== sortedNew[i].moduleId 
            ) {
                return true;
            }
        }

        return false;
    }


    #selectRequesDetail = {
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
        spaceId         : true,
        isPriority      : true,
        createdAt       : true,
        updatedAt       : true,
        professorId     : true,
        grade           : {
            select: {
                id      : true,
                name    : true,
            }
        },
        staffUpdate     : {
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
        requestDetailModules : {
            select : {
                id          : true,
                day         : true,
                moduleId    : true,
            }
        }
    }


    async create(
        createRequestDetailDto  : CreateRequestDetailDto,
        origin                  : string | undefined
    ) {
        const isPriority = this.#getIsPriority( createRequestDetailDto );

        try {
            const requestDetail = await this.requestDetail.create({ data: {
                ...createRequestDetailDto,
                isPriority
            }});

            if ( createRequestDetailDto.moduleDays.length > 0 ) {
                await this.requestDetailModule.createMany({
                    data: createRequestDetailDto.moduleDays.map( moduleDay => ({
                        ...moduleDay,
                        requestDetailId: requestDetail.id
                    }))
                });
            }

            const requestDetailData = await this.findOne( requestDetail.id );

            this.sseService.emitEvent({
                message : requestDetailData,
                action  : EnumAction.CREATE,
                type    : Type.DETAIL,
                origin
            });

            return requestDetailData;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create request detail' );
        }
    }


    async findAll( requestId: string ) {
        return await this.requestDetail.findMany({
            select  : this.#selectRequesDetail,
            where   : { requestId }
        });
    }


    async findOne( id: string ) {
        const requestDetail = await this.requestDetail.findUnique({
            select  : this.#selectRequesDetail,
            where   : { id }
        });

        if ( !requestDetail ) {
            throw new NotFoundException( 'Request detail not found' );
        }

        return requestDetail;
    }


    async update(
        id                      : string,
        updateRequestDetailDto  : UpdateRequestDetailDto,
        origin                  : string | undefined
    ) {
        const isPriority = this.#getIsPriority( updateRequestDetailDto );

        try {
            const currentRequestDetail  = await this.findOne( id );
            const existingModules       = currentRequestDetail.requestDetailModules || [];
            const newModules            = updateRequestDetailDto.moduleDays || [];

            const requestDetail = await this.requestDetail.update({
                where: { id },
                data: {
                    ...updateRequestDetailDto,
                    isPriority
                }
            });

            const modulesChanged = this.#areModulesDifferent( existingModules, newModules );

            if ( modulesChanged ) {
                await this.requestDetailModule.deleteMany({
                    where: {
                        requestDetailId: requestDetail.id
                    }
                });

                if ( newModules.length > 0 ) {
                    await this.requestDetailModule.createMany({
                        data: newModules.map( moduleDay => ({
                            ...moduleDay,
                            requestDetailId: requestDetail.id
                        }))
                    });
                }
            }

            const requestDetailData = await this.findOne( requestDetail.id );

            this.sseService.emitEvent({
                message : requestDetailData,
                action  : EnumAction.UPDATE,
                type    : Type.DETAIL,
                origin
            });

            return requestDetailData;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update request detail' );
        }
    }


    async remove( id: string, origin: string | undefined ) {
        try {
            const requestData = await this.findOne( id );
            await this.requestDetail.delete({ where: { id }});

            this.sseService.emitEvent({
                message : requestData,
                action  : EnumAction.DELETE,
                type    : Type.DETAIL,
                origin
            });

            return requestData;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete request detail' );
        }
    }

}
