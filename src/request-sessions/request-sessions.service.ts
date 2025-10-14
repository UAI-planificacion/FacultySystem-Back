import { Injectable, NotFoundException, OnModuleInit, UnprocessableEntityException } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }          from '@config/prisma-catch';
import { CreateRequestSessionDto }  from '@request-sessions/dto/create-request-session.dto';
import { UpdateRequestSessionDto }  from '@request-sessions/dto/update-request-session.dto';
import { UpdateSessionDayModulesDto } from './dto/update-session-day-modules.dto';


@Injectable()
export class RequestSessionsService extends PrismaClient implements OnModuleInit {

	onModuleInit() {
		this.$connect();
	}

    #selectRequestSession = {
        id              : true,
        session         : true,
        spaceId         : true,
        isEnglish       : true,
        isConsecutive   : true,
        inAfternoon     : true,
        description     : true,
        spaceType       : true,
        building        : true,
        // requestId       : true,
        professor       : {
            select : {
                id: true,
                name: true,
            }
        },
        createdAt       : true,
        updatedAt       : true,
        spaceSize       : {
            select : {
                id      : true,
                detail  : true,
            }
        },
        sessionDayModules: {
            select : {
                dayModuleId: true
            }
        }
    }


	// async create( requestId: string, createRequestSessionDto: CreateRequestSessionDto ) {
	// 	try {
	// 		const { dayModulesId, ...data } = createRequestSessionDto;

	// 		const requestSession = await this.requestSession.create({
	// 			data : {
	// 				...data,
	// 				requestId
	// 			},
	// 		});

	// 		await this.sessionDayModule.createMany({
	// 			data : dayModulesId.map(( dayModuleId ) => ({
	// 				dayModuleId,
	// 				requestSessionId : requestSession.id
	// 			})),
	// 		});

	// 		// const requestSessionData = this.#requestSessionMap( requestSession );

	// 		// this.sseService.emitEvent({
	// 		//     message : requestSessionData,
	// 		//     action  : EnumAction.CREATE,
	// 		//     type    : Type.REQUEST_SESSION,
	// 		//     origin
	// 		// });

	// 		// return requestSessionData;
	// 		return requestSession;
	// 	} catch ( error ) {
	// 		throw PrismaException.catch( error, 'Failed to create request session' );
	// 	}
	// }


    #requestSessionMap = ( requestSession ) => ({
        ...requestSession,
        sessionDayModules: requestSession.sessionDayModules?.map(
            ( sessionDayModule ) => sessionDayModule.dayModuleId
        ),
    });


	async findAllByRequestId( requestId: string ) {
		try {
			const requestSessions = await this.requestSession.findMany({
				where : { requestId },
                select : this.#selectRequestSession
			});

			return requestSessions.map(( requestSession ) => this.#requestSessionMap( requestSession ));
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to find request sessions' );
		}
	}


	async findOne( id: string ) {
		try {
			const requestSession = await this.requestSession.findUnique({
				where : { id },
				select  : this.#selectRequestSession
			});

			if ( !requestSession ) {
				throw new NotFoundException( 'Request session not found' );
			}

			return this.#requestSessionMap( requestSession );
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to find request session' );
		}
	}


	async update( id: string, updateRequestSessionDto: UpdateRequestSessionDto ) {
		try {
			const requestSession = await this.requestSession.update({
                select  : this.#selectRequestSession,
				where   : { id },
                data    : updateRequestSessionDto,
			});


            // await this.request.update({
            //     where : { id: requestSession.requestId },
            //     data  : { status: 'APPROVED' },
            // });

            return this.#requestSessionMap( requestSession )
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to update request session' );
		}
	}

	// Update session day modules for multiple request sessions
	async updateSessionDayModules( updateSessionDayModulesDto: UpdateSessionDayModulesDto[] ) {
		try {
			for ( const dto of updateSessionDayModulesDto ) {
				const { requestSessionId, dayModulesId } = dto;

				const currentSessionDayModules = await this.sessionDayModule.findMany({
					where : { requestSessionId },
				});

                if ( currentSessionDayModules.length === 0 ) {
                    await this.sessionDayModule.createMany({
                        data : dayModulesId.map(( dayModuleId ) => ({
                            dayModuleId,
                            requestSessionId
                        })),
                    });

                    continue;
                }

				const currentDayModuleIds	= currentSessionDayModules.map(( dm ) => dm.dayModuleId ).sort();
				const newDayModuleIds		= dayModulesId.sort();
				const areEqual				= currentDayModuleIds.length === newDayModuleIds.length &&
					currentDayModuleIds.every(( id, index ) => id === newDayModuleIds[index] );

				if ( !areEqual ) {
					await this.sessionDayModule.deleteMany({
						where : { requestSessionId },
					});

					if ( newDayModuleIds.length > 0 ) {
						await this.sessionDayModule.createMany({
							data : newDayModuleIds.map(( dayModuleId ) => ({
								dayModuleId,
								requestSessionId
							})),
						});
					}
				}
			}

            const updatesRequestSessions = await this.requestSession.findMany({
                where : { id: { in: updateSessionDayModulesDto.map(( dto ) => dto.requestSessionId )}},
                select: this.#selectRequestSession
            });

            return updatesRequestSessions.map(( requestSession ) => this.#requestSessionMap( requestSession ));
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to update session day modules' );
		}
	}


	async remove( id: string ) {
		try {
			const requestSession = await this.requestSession.delete({
				where : { id },
			});

			// const requestSessionData = this.#requestSessionMap( requestSession );
			return requestSession;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to delete request session' );
		}
	}

}
