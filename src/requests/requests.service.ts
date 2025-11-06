import { Injectable, OnModuleInit, NotFoundException, UnprocessableEntityException } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

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


    #requestMap = ( request ) => ({
        id              : request.id,
        title           : request.title,
        status          : request.status,
        createdAt       : request.createdAt,
        updatedAt       : request.updatedAt,
        staffCreate     : request.staffCreate,
        staffUpdate     : request.staffUpdate,
        totalDetails    : request._count.requesSessions,
        facultyId       : request.staffCreate.facultyId,
        section         : {
            id              : request.section.id,
            code            : request.section.code,
            startDate       : request.section.startDate,
            endDate         : request.section.endDate,
            isClosed        : request.section.isClosed,
            laboratory      : request.section.laboratory,
            workshop        : request.section.workshop,
            tutoringSession : request.section.tutoringSession,
            lecture         : request.section.lecture,
            spaceSizeId     : request.section.spaceSizeId,
            spaceType       : request.section.spaceType,
            building        : request.section.building,
            professor       : {
                id              : request.section.professor.id,
                name            : request.section.professor.name
            },
            period: {
                id      : request.section.period.id,
                name    : request.section.period.name
            },
            subject: {
                id      : request.section.subject.id,
                name    : request.section.subject.name
            },
            countSessions: {
                sessions    : request.section._count.sessions
            }
        },
    });


    #requestSectionMap = ( request ) => ({
        ...request,
        requestSessions : request.requestSessions.map(( requestSession ) => ({
            ...requestSession,
            sessionDayModules   : requestSession.sessionDayModules.map(( sessionDayModule ) => ({
                id      : sessionDayModule.id,
                dayId   : sessionDayModule.dayModule.dayId,
                module  : sessionDayModule.dayModule.module,
            }))
        }))
    });


    #selectRequest = {
        id              : true,
        title           : true,
        status          : true,
        createdAt       : true,
        updatedAt       : true,
        staffCreate     : {
            select: {
                id          : true,
                name        : true,
                email       : true,
                role        : true,
                facultyId   : true
            }
        },
        staffUpdate     : {
            select: {
                id      : true,
                name    : true,
                email   : true,
                role    : true
            }
        },
        section : {
            select : {
                id              : true,
                code            : true,
                startDate       : true,
                endDate         : true,
                isClosed        : true,
                laboratory      : true,
                workshop        : true,
                tutoringSession : true,
                lecture         : true,
                spaceType       : true,
                spaceSizeId     : true,
                building        : true,
                professor       : {
                    select: {
                        id      : true,
                        name    : true  
                    }
                },
                period: {
                    select : {
                        id      : true,
                        name    : true
                    }
                },
                subject : {
                    select : {
                        id      : true,
                        name    : true
                    }
                },
                _count : {
                    select: {
                        sessions: true
                    }
                }
            }
        },
        _count: {
            select: {
                requestSessions: true
            }
        },
    }


    async create(
        createRequestDto    : CreateRequestDto,
        origin              : string | undefined
    ) {
        try {
            const { requestSessions, ...requestData } = createRequestDto;

            if ( requestSessions.length > 4 ) {
                throw new UnprocessableEntityException( 'Solo se permiten 4 sesiones (Cátedra, Ayudantía, Taller y Laboratorio)' );
            }

            if ( requestSessions.length === 0 ) {
                throw new UnprocessableEntityException( 'No se proporcionaron sesiones' );
            }

            const request = await this.request.create({
                data    : requestData,
                select  : { id : true }
                // select  : this.#selectRequest
            });

            const requestSessionsCreated = await this.requestSession.createManyAndReturn({
                data : requestSessions.map(( sessionDto ) => ({
                    session         : sessionDto.session,
                    spaceId         : sessionDto.spaceId,
                    isEnglish       : sessionDto.isEnglish,
                    isConsecutive   : sessionDto.isConsecutive,
                    inAfternoon     : sessionDto.inAfternoon,
                    description     : sessionDto.description,
                    spaceType       : sessionDto.spaceType,
                    building        : sessionDto.building,
                    professorId     : sessionDto.professorId,
                    spaceSizeId     : sessionDto.spaceSizeId,
                    requestId       : request.id
                }))
            });

            const sessionDayModulesData = requestSessionsCreated.flatMap(( createdSession, index ) => {
                const originalSession = requestSessions[index];
                return originalSession.dayModulesId.map(( dayModuleId ) => ({
                    requestSessionId    : createdSession.id,
                    dayModuleId         : dayModuleId
                }));
            });

            await this.sessionDayModule.createMany({
                data : sessionDayModulesData
            });

            const requestMapped = await this.request.findUnique({
                where : { id : request.id },
                select: this.#selectRequest
            });

            // this.sseService.emitEvent({
            //     message : requestMapped,
            //     action  : EnumAction.CREATE,
            //     type    : Type.REQUEST,
            //     origin
            // });

            return requestMapped;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create request' );
        }
    }


    async findAll() {
        const requests = await this.request.findMany({
            select  : this.#selectRequest,
        });

        if ( requests.length === 0 ) {
            return [];
        }

        return requests.map(( request ) => this.#requestMap( request ));
    }


    async findAllByFacultyId( facultyId: string ) {
        const requests = await this.request.findMany({
            select  : this.#selectRequest,
            where   : {
                staffCreate: {
                    facultyId
                }
            }
        });

        if ( requests.length === 0 ) {
            return [];
        }

        return requests.map(( request ) => this.#requestMap( request ));
    }


    async findOne( sectionId: string ) {
        const request = await this.request.findUnique({
            select  : this.#selectRequest,
            where   : { sectionId }
        });

        if ( !request ) {
            throw new NotFoundException( 'Request not found' );
        }

        return this.#requestMap( request );
    }



    async findBySectionId( sectionId: string ) {
        const request = await this.request.findUnique({
            select : {
                id              : true,
                title           : true,
                status          : true,
                createdAt       : true,
                updatedAt       : true,
                staffCreate     : {
                    select: {
                        id          : true,
                        name        : true,
                        email       : true,
                        role        : true,
                        facultyId   : true
                    }
                },
                staffUpdate     : {
                    select: {
                        id      : true,
                        name    : true,
                        email   : true,
                        role    : true
                    }
                },
                requestSessions : {
                    select : {
                        id              : true,
                        session         : true,
                        building        : true,
                        spaceId         : true,
                        isEnglish       : true,
                        isConsecutive   : true,
                        description     : true,
                        spaceType       : true,
                        inAfternoon     : true,
                        professor       : {
                            select : {
                                id : true,
                                name : true
                            }
                        },
                        spaceSize : {
                            select : {
                                id : true,
                                detail : true
                            }
                        },
                        sessionDayModules: {
                            select: {
                                id          : true,
                                dayModule   : {
                                    select      : {
                                        dayId       : true,
                                        module      : {
                                            select      : {
                                                id          : true,
                                                code        : true,
                                                startHour   : true,
                                                endHour     : true,
                                                difference  : true,
                                                isActive    : true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            where   : { sectionId },
        });

        if ( !request ) {
            throw new NotFoundException( 'Request not found' );
        }

        return this.#requestSectionMap( request );
    }


    async update(
        id                  : string,
        updateRequestDto    : UpdateRequestDto,
        origin              : string | undefined
    ) {
        try {
            const requestUpdated = await this.request.update({
                select  : this.#selectRequest,
                where   : { id },
                data    : updateRequestDto
            });

            const requestData = this.#requestMap( requestUpdated );

            this.sseService.emitEvent({
                message : requestData,
                action  : EnumAction.UPDATE,
                type    : Type.REQUEST,
                origin
            });

            return requestData;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update request' );
        }
    }


    async remove( id: string, origin: string | undefined ) {
        try {
            await this.request.delete({
                select: this.#selectRequest,
                where: { id }
            });

            this.sseService.emitEvent({
                message : true,
                action  : EnumAction.DELETE,
                type    : Type.REQUEST,
                origin
            });

            return true;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete request' );
        }
    }

}
