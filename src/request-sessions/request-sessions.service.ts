import { Injectable, NotFoundException, OnModuleInit, UnprocessableEntityException } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }          from '@config/prisma-catch';
import { CreateRequestSessionDto }  from '@request-sessions/dto/create-request-session.dto';
import { UpdateRequestSessionDto }  from '@request-sessions/dto/update-request-session.dto';


@Injectable()
export class RequestSessionsService extends PrismaClient implements OnModuleInit {

	onModuleInit() {
		this.$connect();
	}


	async create( requestId: string, createRequestSessionDto: CreateRequestSessionDto ) {
		try {
			const { dayModulesId, ...data } = createRequestSessionDto;

			const requestSession = await this.requestSession.create({
				data : {
					...data,
					requestId
				},
			});

			await this.sessionDayModule.createMany({
				data : dayModulesId.map(( dayModuleId ) => ({
					dayModuleId,
					requestSessionId : requestSession.id
				})),
			});

			// const requestSessionData = this.#requestSessionMap( requestSession );

			// this.sseService.emitEvent({
			//     message : requestSessionData,
			//     action  : EnumAction.CREATE,
			//     type    : Type.REQUEST_SESSION,
			//     origin
			// });

			// return requestSessionData;
			return requestSession;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to create request session' );
		}
	}


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
                select : {
                    id              : true,
                    session         : true,
                    spaceId         : true,
                    isEnglish       : true,
                    isConsecutive   : true,
                    inAfternoon     : true,
                    description     : true,
                    spaceType       : true,
                    building        : true,
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
			});

			return requestSessions.map(( requestSession ) => this.#requestSessionMap( requestSession ));
			// return requestSessions;
		} catch ( error ) {
			console.log('🚀 ~ file: request-sessions.service.ts:136 ~ error:', error)
			throw PrismaException.catch( error, 'Failed to find request sessions' );
		}
	}


	async findOne( id: string ) {
		try {
			const requestSession = await this.requestSession.findUnique({
				where : { id },
				// select  : this.#selectRequestSession
			});

			if ( !requestSession ) {
				throw new NotFoundException( 'Request session not found' );
			}

			// const requestSessionData = this.#requestSessionMap( requestSession );
			return requestSession;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to find request session' );
		}
	}


	async update( id: string, updateRequestSessionDto: UpdateRequestSessionDto ) {
		try {
			const { dayModulesId, ...data } = updateRequestSessionDto;

			const requestSession = await this.requestSession.update({
				where : { id },
				data
			});

			const dayModulesByRequestSession = await this.sessionDayModule.findMany({
				where : { requestSessionId: id },
			});

			const currentDayModuleIds   = dayModulesByRequestSession.map(( dm ) => dm.dayModuleId ).sort();
			const newDayModuleIds       = ( dayModulesId || [] ).sort();
			const areEqual              = currentDayModuleIds.length === newDayModuleIds.length &&
				currentDayModuleIds.every(( id, index ) => id === newDayModuleIds[index] );

			if ( !areEqual ) {
				await this.sessionDayModule.deleteMany({
					where : { requestSessionId: id },
				});

				if ( newDayModuleIds.length > 0 ) {
					await this.sessionDayModule.createMany({
						data : newDayModuleIds.map(( dayModuleId ) => ({
							dayModuleId,
							requestSessionId: requestSession.id
						})),
					});
				}
			}

			// const requestSessionData = this.#requestSessionMap( requestSession );
			return requestSession;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to update request session' );
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
