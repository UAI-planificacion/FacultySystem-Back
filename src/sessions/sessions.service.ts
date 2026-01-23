import {
    BadRequestException,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { $Enums, PrismaClient } from 'generated/prisma';
import * as XLSX                from 'xlsx';

import {
    SessionAvailabilityResponse,
    AvailableSpace,
    AvailableProfessor,
    ScheduledDate
}                                   from '@sessions/interfaces/session-availability.interface';
import {
	AssignSessionAvailabilityDto
}                                   from '@sessions/dto/assign-session-availability.dto';
import {
	AssignSessionRegisteredDto
}                                   from '@sessions/dto/assign-session-registered.dto';
import {
    AssignmentDto,
    ExcelSectionDto,
    ExcelSessionDto,
    SectionDataDto,
    SessionAvailabilityResult,
    SessionDataDto,
    Status,
    Type
}                                   from '@sessions/interfaces/excelSession.dto';
import { Space, SpacesService }     from '@commons/services/spaces.service';
import { PrismaException }          from '@config/prisma-catch';
import { CreateSessionDto }         from '@sessions/dto/create-session.dto';
import { UpdateSessionDto }         from '@sessions/dto/update-session.dto';
import { UpdateMultipleSessionTimesDto } from '@sessions/dto/update-session-times.dto';
import { CreateMassiveSessionDto }  from '@sessions/dto/create-massive-session.dto';
import { MassiveUpdateSessionDto }  from '@sessions/dto/massive-update-session.dto';
import { CalculateAvailabilityDto } from '@sessions/dto/calculate-availability.dto';
import { AvailableSessionDto }      from '@sessions/dto/available-session.dto';
import { SectionSession }           from '@sessions/dto/session-update-times.dto';
import { SectionsService }          from '@sections/sections.service';
import { SectionDto }               from '@sections/dto/section.dto';
import { SELECT_SECTION }           from '@commons/querys/sections-query';
import { SELECT_SESSION }           from '@commons/querys/session-query';


@Injectable()
export class SessionsService extends PrismaClient implements OnModuleInit {

    constructor(
        private readonly sectionsService    : SectionsService,
        private readonly spacesService      : SpacesService
    ) {
        super();
    }


    onModuleInit() {
        this.$connect();
    }


    convertToSessionDto = ( session: any ) => ({
        id                  : session.id,
        name                : session.name,
        spaceId             : session.spaceId,
        isEnglish           : session.isEnglish,
        chairsAvailable     : session.chairsAvailable,
        professor           : session.professor,
        dayId               : session.dayModule?.dayId || null,
        dayModuleId         : session.dayModule?.id || null,
        date                : session.date,
        planningChangeId    : session.planningChange?.id || null,
        section             : {
            id                  : session.section?.id || null,
            code                : session.section?.code || null,
            startDate           : session.section?.startDate || null,
            endDate             : session.section?.endDate || null,
            building            : session.section?.building || null,
            subject             : {
                id                  : session.section?.subject?.id || null,
                name                : session.section?.subject?.name || null,
            }
        },
        module: session.dayModule?.module ? {
            id          : session.dayModule.module.id,
            code        : session.dayModule.module.code,
            name        : `M${session.dayModule.module.code}${session.dayModule.module.difference ? `-${session.dayModule.module.difference} ` : ''} ${session.dayModule.module.startHour}-${session.dayModule.module.endHour}`,
            startHour   : session.dayModule.module.startHour,
            endHour     : session.dayModule.module.endHour,
            difference  : session.dayModule.module.difference,
        } : null,
    });


    #convertToSectionDto = ( section: any ): SectionDto => ({
        id              : section.id,
        code            : section.code,
        isClosed        : section.isClosed,
        groupId         : section.groupId,
        startDate       : section.startDate,
        endDate         : section.endDate,
        spaceSizeId     : section.spaceSizeId,
        spaceType       : section.spaceType,
        workshop        : section.workshop,
        lecture         : section.lecture,
        tutoringSession : section.tutoringSession,
        laboratory      : section.laboratory,
        quota           : section.quota,
        registered      : section.registered,
        building        : section.building,
        professor       : section.professor?.id ? {
            id      : section.professor?.id,
            name    : section.professor?.name,
        } : null,
        subject: {
            id      : section.subject.id,
            name    : section.subject.name,
        },
        period: {
            id          : section.period.id,
            name        : section.period.name,
            startDate   : section.period.startDate,
            endDate     : section.period.endDate,
            openingDate : section.period.openingDate,
            closingDate : section.period.closingDate,
        },
        sessionsCount   : section._count.sessions,
        sessions        : section.sessions.map(( session : any ) => ({
            id              : session.id,
            spaceId         : session.spaceId,
            dayId           : session.dayModule?.dayId,
            moduleId        : session.dayModule?.moduleId,
            professorId     : session.professor?.id,
        })),
        haveRequest: !!section.request?.id
    });


    async create( createSessionDto: CreateSessionDto ) {
        try {
            const session = await this.session.create({
                data: createSessionDto,
                select: SELECT_SESSION,
            });

            return this.convertToSessionDto( session );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create session' );
        }
    }


    async calculateSessionAvailability(
        sectionId                   : string,
        calculateAvailabilityDtos   : CalculateAvailabilityDto[]
    ): Promise<SessionAvailabilityResponse[]> {
        try {
            // 1. Obtener la información de la sección con sus fechas
            const section = await this.section.findUnique({
                where   : { id: sectionId },
                select  : {
                    id      : true,
                    period  : {
                        select : {
                            startDate   : true,
                            endDate     : true,
                            openingDate : true,
                            closingDate : true,
                        }
                    }
                }
            });

            if ( !section ) {
                throw new NotFoundException( `Section with id ${sectionId} not found` );
            }

            const startDate     = section.period.openingDate || section.period.startDate;
            const endDate       = section.period.closingDate || section.period.endDate;
            const currentDate   = new Date();

            currentDate.setHours( 0, 0, 0, 0 ); // Reset time to start of day for comparison

            // Validar que la fecha actual esté dentro del rango permitido
            if ( currentDate < startDate ) {
                throw new BadRequestException(
                    `No se pueden calcular sesiones antes de la fecha de inicio de la sección. ` +
                    `La sección inicia el ${startDate.toISOString().split( 'T' )[0]}, ` +
                    `la fecha actual es ${currentDate.toISOString().split( 'T' )[0]}.`
                );
            }

            // No permitir calcular sesiones si la fecha actual es mayor o igual a la fecha de fin
            if ( currentDate >= endDate ) {
                throw new BadRequestException(
                    `No se pueden calcular sesiones en o después de la fecha de fin de la sección. ` +
                    `La sección finaliza el ${endDate.toISOString().split( 'T' )[0]}, ` +
                    `la fecha actual es ${currentDate.toISOString().split( 'T' )[0]}. ` +
                    `Las sesiones deben calcularse antes de la fecha de fin.`
                );
            }

            // 2. Obtener todos los espacios del servicio externo (una sola vez)
            const allSpaces = await this.spacesService.getSpaces();

            // 3. Procesar cada sesión
            const results: SessionAvailabilityResponse[] = [];

            for ( const calculateAvailabilityDto of calculateAvailabilityDtos ) {
                const {
                    session,
                    building,
                    spaceIds,
                    spaceType,
                    spaceSize,
                    professorIds,
                    dayModuleIds
                } = calculateAvailabilityDto;

                // 3.1. Filtrar espacios según los criterios de esta sesión
                let filteredSpaces = allSpaces.filter( space => space.active );

                if ( spaceIds && spaceIds.length > 0 ) {
                    // Si vienen spaceIds, filtrar solo esos
                    filteredSpaces = filteredSpaces.filter( space => spaceIds.includes( space.name ) );
                } else {
                    // Si no vienen spaceIds, filtrar por building, type y/o size
                    if ( building ) {
                        filteredSpaces = filteredSpaces.filter( space => space.building === building );
                    }

                    if ( spaceType ) {
                        filteredSpaces = filteredSpaces.filter( space => space.type === spaceType );
                    }

                    if ( spaceSize ) {
                        filteredSpaces = filteredSpaces.filter( space => space.size === spaceSize );
                    }
                }

                // 3.2. Obtener información de los dayModules de esta sesión
                const dayModules = await this.dayModule.findMany({
                    where   : {
                        id: { in: dayModuleIds }
                    },
                    include : {
                        day     : true,
                        module  : true,
                    }
                });

                if ( dayModules.length !== dayModuleIds.length ) {
                    throw new BadRequestException( `Some dayModuleIds are invalid: ${dayModuleIds.join( ', ' )}` );
                }

                // 3.3. Calcular todas las fechas posibles para cada dayModule de esta sesión
                const scheduledDates: ScheduledDate[] = [];

                for ( const dayModule of dayModules ) {
                    const dayOfWeek = dayModule.day.id;
                    const dates     = this.calculateDatesForDayOfWeek( startDate, endDate, dayOfWeek );

                    for ( const date of dates ) {
                        scheduledDates.push({
                            date        : date,
                            dayModuleId : dayModule.id,
                            dayName     : dayModule.day.name,
                            timeRange   : `${dayModule.module.startHour}-${dayModule.module.endHour}`,
                        });
                    }
                }

                // 3.4. Validar disponibilidad de espacios para esta sesión
                const availableSpaces: AvailableSpace[] = [];

                for ( const space of filteredSpaces ) {
                    let isAvailable = true;

                    for ( const scheduledDate of scheduledDates ) {
                        const existingSession = await this.session.findFirst({
                            where: {
                                date        : scheduledDate.date,
                                dayModuleId : scheduledDate.dayModuleId,
                                spaceId     : space.name,
                                sectionId   : { not: sectionId },
                            }
                        });

                        if ( existingSession ) {
                            isAvailable = false;
                            break;
                        }
                    }

                    if ( isAvailable ) {
                        availableSpaces.push({
                            id       : space.name,
                            name     : space.name,
                            building : space.building,
                            type     : space.type,
                            capacity : space.capacity,
                            size     : space.size,
                        });
                    }
                }

                // 3.5. Caso edge: Si vinieron spaceIds pero ninguno está disponible, buscar similares
                if ( spaceIds && spaceIds.length > 0 && availableSpaces.length === 0 ) {
                    // Obtener características de los espacios solicitados
                    const requestedSpaces = allSpaces.filter( space => spaceIds.includes( space.name ) );
                    
                    if ( requestedSpaces.length > 0 ) {
                        const buildings = [...new Set( requestedSpaces.map( s => s.building ) )];
                        const types     = [...new Set( requestedSpaces.map( s => s.type ) )];
                        const sizes     = [...new Set( requestedSpaces.map( s => s.size ) )];

                        // Filtrar espacios similares
                        let similarSpaces = allSpaces.filter( space => 
                            space.active && 
                            !spaceIds.includes( space.name ) &&
                            ( buildings.includes( space.building ) || types.includes( space.type ) || sizes.includes( space.size ) )
                        );

                        // Validar disponibilidad de espacios similares
                        for ( const space of similarSpaces ) {
                            let isAvailable = true;

                            for ( const scheduledDate of scheduledDates ) {
                                const existingSession = await this.session.findFirst({
                                    where: {
                                        date        : scheduledDate.date,
                                        dayModuleId : scheduledDate.dayModuleId,
                                        spaceId     : space.name,
                                        sectionId   : { not: sectionId },
                                    }
                                });

                                if ( existingSession ) {
                                    isAvailable = false;
                                    break;
                                }
                            }

                            if ( isAvailable ) {
                                availableSpaces.push({
                                    id       : space.name,
                                    name     : space.name,
                                    building : space.building,
                                    type     : space.type,
                                    capacity : space.capacity,
                                    size     : space.size,
                                });
                            }
                        }
                    }
                }

                // 3.6. Validar disponibilidad de profesores para esta sesión
                const availableProfessors: AvailableProfessor[] = [];

                if ( professorIds && professorIds.length > 0 ) {
                    for ( const professorId of professorIds ) {
                        // Obtener información del profesor
                        const professor = await this.professor.findUnique({
                            where   : { id: professorId },
                            select  : {
                                id      : true,
                                name    : true,
                            }
                        });

                        if ( !professor ) {
                            continue;
                        }

                        let isAvailable = true;

                        for ( const scheduledDate of scheduledDates ) {
                            const existingSession = await this.session.findFirst({
                                where: {
                                    date        : scheduledDate.date,
                                    dayModuleId : scheduledDate.dayModuleId,
                                    professorId : professorId,
                                    sectionId   : { not: sectionId },
                                }
                            });

                            if ( existingSession ) {
                                isAvailable = false;
                                break;
                            }
                        }

                        availableProfessors.push({
                            id        : professor.id,
                            name      : professor.name,
                            available : isAvailable,
                        });
                    }
                }

                // 3.7. Agregar resultado de esta sesión
                results.push({
                    session             : session,
                    availableSpaces     : availableSpaces,
                    availableProfessors : availableProfessors,
                    scheduledDates      : scheduledDates,
                    isReadyToCreate     : availableSpaces.length > 0,
                });
            }

            // 4. Retornar todos los resultados
            return results;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to calculate session availability' );
        }
    }


    async createMassive( sectionId: string, createMassiveSessionsDto: CreateMassiveSessionDto[] ) {
        try {
            // 1. Obtener la información de la sección con sus fechas
            const section = await this.section.findUnique({
                where   : { id: sectionId },
                select  : {
                    id          : true,
                    professorId : true,
                    quota       : true,
                    registered  : true,
                    period      : {
                        select : {
                            startDate   : true,
                            endDate     : true,
                            openingDate : true,
                            closingDate : true,
                        }
                    },
                    _count: {
                        select: {
                            sessions: true
                        }
                    }
                }
            });

            if ( !section ) {
                throw new NotFoundException( `Section with id ${sectionId} not found` );
            }

            if ( section._count.sessions > 0 ) {
                throw new BadRequestException( 'Esta sección ya ha sido planificada.' );
            }

            const startDate = section.period.openingDate || section.period.startDate;
            const endDate   = section.period.closingDate || section.period.endDate;
            const quota     = section.registered || section.quota;

            // const { startDate, endDate } = section;
            const currentDate = new Date();
            currentDate.setHours( 0, 0, 0, 0 ); // Reset time to start of day for comparison

            // Validar que la fecha actual esté dentro del rango permitido
            if ( currentDate < startDate ) {
                throw new BadRequestException(
                    `No se pueden crear sesiones antes de la fecha de inicio de la sección. ` +
                    `La sección inicia el ${startDate.toISOString().split( 'T' )[0]}, ` +
                    `la fecha actual es ${currentDate.toISOString().split( 'T' )[0]}.`
                );
            }

            // No permitir crear sesiones si la fecha actual es mayor o igual a la fecha de fin
            if ( currentDate >= endDate ) {
                throw new BadRequestException(
                    `No se pueden crear sesiones en o después de la fecha de fin de la sección. ` +
                    `La sección finaliza el ${endDate.toISOString().split( 'T' )[0]}, ` +
                    `la fecha actual es ${currentDate.toISOString().split( 'T' )[0]}. ` +
                    `Las sesiones deben crearse antes de la fecha de fin.`
                );
            }

            const sessionsToCreate: Array<{
                name            : $Enums.SessionName;
                sectionId       : string;
                dayModuleId     : number;
                spaceId         : string | null;
                professorId     : string | null;
                isEnglish       : boolean;
                date            : Date;
                chairsAvailable : number | null;
            }> = [];

            // 1.1. Obtener todos los espacios una sola vez
            const allSpaces = await this.spacesService.getSpaces();
            const spacesMap = new Map( allSpaces.map( space => [space.name, space] ));

            // 2. Procesar cada sesión del DTO
            for ( const sessionDto of createMassiveSessionsDto ) {
                const { session, dayModuleIds, spaceId, professorId, isEnglish } = sessionDto;

                // 3. Obtener información de los dayModules
                const dayModules = await this.dayModule.findMany({
                    where   : {
                        id: { in: dayModuleIds }
                    },
                    include : {
                        day     : true,
                        module  : true,
                    }
                });

                if ( dayModules.length !== dayModuleIds.length ) {
                    throw new BadRequestException( `Some dayModuleIds are invalid: ${dayModuleIds.join( ', ' )}` );
                }

                // 4. Calcular todas las fechas posibles para cada dayModule
                for ( const dayModule of dayModules ) {
                    // Calcular todas las fechas que coinciden con este día de la semana
                    const dates = this.calculateDatesForDayOfWeek( startDate, endDate, dayModule.day.id );

                    // 5. Crear una sesión para cada fecha calculada
                    for ( const date of dates ) {
                        let chairsAvailable: number | null = null;

                        if ( spaceId ) {
                            const space = spacesMap.get( spaceId );

                            if ( !space ) {
                                throw new BadRequestException( `El espacio ${spaceId} no existe o no está disponible` );
                            }

                            chairsAvailable = space.capacity - quota;
                        }

                        sessionsToCreate.push({
                            name            : session,
                            sectionId       : sectionId,
                            dayModuleId     : dayModule.id,
                            spaceId         : spaceId       || null,
                            professorId     : professorId   || null,
                            isEnglish       : isEnglish     || false,
                            date,
                            chairsAvailable,
                        });
                    }
                }
            }

            // 6. Validar que no haya conflictos de fecha y espacio
            await this.validateSessionConflicts( sessionsToCreate );
            // 7. Crear todas las sesiones en una transacción
            await this.session.createMany({
                data: sessionsToCreate,
            });

            // 8. Retornar la sección completa con las sesiones creadas
            return await this.sectionsService.findOne( sectionId );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create sessions' );
        }
    }

	/**
	 * Find all available dates for a session based on dayModuleId, and optionally spaceId and professorId
	 * @param availableSessionDto - Object containing sessionId or sectionId (required), dayModuleId (required), spaceId (optional) and professorId (optional)
	 * @returns Array of available dates. If spaceId is not provided, returns all dates calculated from dayModuleId without space conflict validation
	 */
	async findAvailableSessions(
        availableSessionDto: AvailableSessionDto
	): Promise<Date[]> {
		try {
            const { sessionId, sectionId, dayModuleId, spaceId, professorId } = availableSessionDto;
			// 1. Get current session with professor and section date range

            let sectionSession;
            let startDate : Date | null = null;
            let endDate   : Date | null = null;

            if ( sessionId ) {
                sectionSession = await this.session.findUnique({
                    where	: { id: sessionId },
                    select	: {
                        professorId	: true,
                        section		: {
                            select: {
                                startDate	: true,
                                endDate		: true
                            }
                        }
                    }
                });

                startDate = sectionSession.section.startDate;
                endDate   = sectionSession.section.endDate;
            }

            if ( sectionId ) {
                sectionSession = await this.section.findUnique({
                    where   : { id: sectionId },
                    select  : {
                        startDate   : true,
                        endDate     : true,
                    }
                });

                startDate = sectionSession.startDate;
                endDate   = sectionSession.endDate;
            }

			if ( !sectionSession || !startDate || !endDate ) {
				throw new NotFoundException( `Session with id ${sessionId} not found` );
			}

			// const { startDate, endDate } = sectionSession.section;

			// 2. Get dayModule information
			const dayModule = await this.dayModule.findUnique({
				where	: { id: Number( dayModuleId ) },
				include	: {
					day		: true,
					module	: true,
				}
			});

			if ( !dayModule ) {
				throw new NotFoundException( `DayModule with id ${dayModuleId} not found` );
			}

			// 3. Calculate all possible dates for this day of the week
			const possibleDates = this.calculateDatesForDayOfWeek( startDate, endDate, dayModule.day.id );

			// 4. Find all sessions with space conflicts (only if spaceId is provided)
			let spaceConflicts: { date: Date }[] = [];
			
			if ( spaceId ) {
				spaceConflicts = await this.session.findMany({
					where: {
						spaceId	: spaceId,
						date	: { in: possibleDates }
					},
					select: { date: true }
				});
			}

			// 5. Find all sessions with professor conflicts (1 query, only if professor is different)
			let professorConflicts: { date: Date }[] = [];

			if ( professorId && professorId !== sectionSession.professorId ) {
				professorConflicts = await this.session.findMany({
					where: {
						professorId	: professorId,
						dayModuleId	: Number( dayModuleId ),
						date		: { in: possibleDates }
					},
					select: { date: true }
				});
			}

			// 6. Filter available dates (no queries in the loop)
			const availableDates = possibleDates.filter( date => {
				const hasSpaceConflict = spaceConflicts.some( sc => 
					sc.date.getTime() === date.getTime()
				);

				const hasProfessorConflict = professorConflicts.some( pc => 
					pc.date.getTime() === date.getTime()
				);

				return !hasSpaceConflict && !hasProfessorConflict;
			});

			return availableDates;
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to find available sessions' );
		}
	}

	/**
	 * Assign spaces or professors to sessions validating availability and capacities.
	 * @param assignments - Listado de sesiones con la asignación a aplicar.
	 * @returns Updated sessions converted to DTO format.
	 */
	async assignSessionAvailability(
		seamlessly: boolean,
		assignments: AssignSessionAvailabilityDto[]
	) {
		try {
			if ( assignments.length === 0 ) {
				throw new BadRequestException( 'No se recibieron asignaciones para procesar' );
			}

			const sessionIds        : string[]      = [];
			const sessionIdTracker  : Set<string>   = new Set();

            let type: Type | null = null;

			for ( const assignment of assignments ) {
				if ( sessionIdTracker.has( assignment.sessionId )) {
					throw new BadRequestException( `La sesión ${assignment.sessionId} está duplicada en la solicitud` );
				}

				sessionIdTracker.add( assignment.sessionId );
				sessionIds.push( assignment.sessionId );

				const hasSpace       = Boolean( assignment.spaceId );
				const hasProfessor   = Boolean( assignment.professorId );

				if ( hasSpace === hasProfessor ) {
					throw new BadRequestException( 'Cada asignación debe incluir únicamente spaceId o professorId' );
				}

				const currentType = hasSpace
					? Type.SPACE
					: Type.PROFESSOR;

				if ( type === null ) {
					type = currentType;
				} else if ( type !== currentType ) {
					throw new BadRequestException( 'Todas las asignaciones deben pertenecer al mismo tipo' );
				}
			}

			if ( type === null ) {
				throw new BadRequestException( 'No se pudo determinar el tipo de asignación a partir de los datos enviados' );
			}

			const sessions = await this.session.findMany({
				where   : { id: { in: sessionIds }},
				select  : {
					id          : true,
					date        : true,
					dayModuleId : true,
					section     : {
						select : {
							quota : true,
                            registered: true
						}
					}
				}
			});

			const sessionMap = new Map( sessions.map( session => [session.id, session] ));

			let spacesMap       : Map<string, Space> = new Map();
			let professorMap    : Map<string, { id: string; name: string }> = new Map();

			if ( type === Type.SPACE ) {
				const allSpaces = await this.spacesService.getSpaces();

				spacesMap = new Map( allSpaces.map( space => [space.name, space] ));
			}

			if ( type === Type.PROFESSOR ) {
				const professorIds = Array.from(
					new Set(
						assignments
							.map( assignment => assignment.professorId )
							.filter( ( professorId ): professorId is string => Boolean( professorId ) )
					)
				);

				if ( professorIds.length === 0 ) {
					throw new BadRequestException( 'Debe proporcionar al menos un profesor para el tipo professor' );
				}

				const professors = await this.professor.findMany({
					where   : { id: { in: professorIds }},
					select  : {
						id      : true,
						name    : true
					}
				});

				professorMap = new Map( professors.map( professor => [professor.id, professor] ));
			}

			const availabilityKeys  : Set<string> = new Set();
			const sessionUpdates    : {
				id      : string;
				data    : {
					spaceId?         : string;
					chairsAvailable? : number;
					professorId?     : string | null;
				};
			}[] = [];

			for ( const assignment of assignments ) {
				const session = sessionMap.get( assignment.sessionId );

				if ( !session ) {
					throw new BadRequestException( `La sesión ${assignment.sessionId} no existe` );
				}

				// if ( session.dayModuleId === null || session.dayModuleId === undefined ) {
				// 	throw new BadRequestException( `La sesión ${assignment.sessionId} no tiene dayModule configurado` );
				// }

				if ( type === Type.SPACE ) {
					const { spaceId, professorId } = assignment;

					if ( !spaceId ) {
						throw new BadRequestException( `La sesión ${assignment.sessionId} no incluye un spaceId` );
					}

					if ( professorId ) {
						throw new BadRequestException( 'No se puede enviar professorId cuando el tipo es space' );
					}

					const space = spacesMap.get( spaceId );

					if ( !space ) {
						throw new BadRequestException( `El espacio ${spaceId} no existe o no está disponible` );
					}

					if ( !space.active ) {
						throw new BadRequestException( `El espacio ${spaceId} está inactivo` );
					}

					const availabilityKey = `${spaceId}_${session.date.toISOString()}_${session.dayModuleId}`;

					if ( availabilityKeys.has( availabilityKey )) {
						throw new BadRequestException( `El espacio ${spaceId} se intenta asignar más de una vez en el mismo horario` );
					}

					availabilityKeys.add( availabilityKey );

					const conflictingSession = await this.session.findFirst({
						where   : {
							date        : session.date,
							dayModuleId : session.dayModuleId,
							spaceId     : spaceId,
							id          : { not: session.id }
						},
						select  : { id: true }
					});

					if ( conflictingSession ) {
						throw new BadRequestException( `El espacio ${spaceId} ya está reservado para este horario` );
					}

					const quota           = session.section?.registered || session.section?.quota;
					const chairsAvailable = space.capacity - quota;

                    // Si seamlessly es true no se puede asignar negativos
                    // Si seamlessly es false se pueden asignar negativos
                    if ( chairsAvailable < 0 && seamlessly ) {
                        continue;
                    }

					sessionUpdates.push({
						id      : session.id,
						data    : {
							spaceId         : spaceId,
							chairsAvailable : chairsAvailable
						}
					});
				}

				if ( type === Type.PROFESSOR ) {
					const { professorId, spaceId } = assignment;

					if ( !professorId ) {
						throw new BadRequestException( `La sesión ${assignment.sessionId} no incluye un professorId` );
					}

					if ( spaceId ) {
						throw new BadRequestException( 'No se puede enviar spaceId cuando el tipo es professor' );
					}

					const professor = professorMap.get( professorId );

					if ( !professor ) {
						throw new BadRequestException( `El profesor ${professorId} no existe o no está disponible` );
					}

					const availabilityKey = `${professorId}_${session.date.toISOString()}_${session.dayModuleId}`;

					if ( availabilityKeys.has( availabilityKey )) {
						throw new BadRequestException( `El profesor ${professorId} se intenta asignar más de una vez en el mismo horario` );
					}

					availabilityKeys.add( availabilityKey );

					const conflictingSession = await this.session.findFirst({
						where   : {
							date        : session.date,
							dayModuleId : session.dayModuleId,
							professorId : professorId,
							id          : { not: session.id }
						},
						select  : { id: true }
					});

					if ( conflictingSession ) {
						throw new BadRequestException( `El profesor ${professorId} ya está asignado en este horario` );
					}

					sessionUpdates.push({
						id      : session.id,
						data    : {
							professorId : professorId
						}
					});
				}
			}

			for ( const update of sessionUpdates ) {
				await this.session.update({
					where   : { id: update.id },
					data    : update.data
				});
			}

			const updatedSessions = await this.session.findMany({
				where   : { id: { in: sessionIds }},
				select  : SELECT_SESSION
			});

			const orderMap = new Map( sessionIds.map(( sessionId, index ) => [sessionId, index] ));

			updatedSessions.sort(( first, second ) => {
				const firstIndex   = orderMap.get( first.id ) ?? 0;
				const secondIndex  = orderMap.get( second.id ) ?? 0;

				return firstIndex - secondIndex;
			});

			return updatedSessions.map( session => this.convertToSessionDto( session ));
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to assign session availability' );
		}
	}

	/**
	 * Calculate all dates within a range that match a specific day of the week
	 * @param startDate - Start date of the range
	 * @param endDate - End date of the range
	 * @param dayOfWeek - Day of the week (1 = Monday, 7 = Sunday)
	 * @returns Array of dates
	 */
    private calculateDatesForDayOfWeek( startDate: Date, endDate: Date, dayOfWeek: number ): Date[] {
        const dates: Date[] = [];
        const currentDate   = new Date( startDate );

        // Ajustar al primer día de la semana deseado
        const currentDayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        
        // Convertir dayOfWeek (1-7) a formato JavaScript (0-6)
        // 1 = Lunes -> 1, 2 = Martes -> 2, ..., 7 = Domingo -> 0
        const targetDayJS = dayOfWeek === 7 ? 0 : dayOfWeek;

        // Calcular días hasta el primer día objetivo
        let daysUntilTarget = targetDayJS - currentDayOfWeek;

        if ( daysUntilTarget < 0 ) {
            daysUntilTarget += 7;
        }

        currentDate.setDate( currentDate.getDate() + daysUntilTarget );

        // Agregar todas las fechas que coincidan con el día de la semana
        while ( currentDate <= endDate ) {
            dates.push( new Date( currentDate ));
            currentDate.setDate( currentDate.getDate() + 7 ); // Siguiente semana
        }

        return dates;
    }


    /**
     * Validate that there are no conflicts between sessions (same date and space)
     * @param sessionsToCreate - Array of sessions to validate
     * @throws Error if conflicts are found
     */
    private async validateSessionConflicts( sessionsToCreate: any[] ): Promise<void> {
        for ( const session of sessionsToCreate ) {
            // Si no tiene spaceId, no hay conflicto posible con espacios
            if ( !session.spaceId ) {
                continue;
            }

            // Buscar sesiones existentes con la misma fecha, espacio y módulo (excluyendo la misma sección)
            const existingSessions = await this.session.findMany({
                where: {
                    date        : session.date,
                    spaceId     : session.spaceId,
                    dayModuleId : session.dayModuleId,
                    sectionId   : { not: session.sectionId },
                },
                select: {
                    id          : true,
                    name        : true,
                    date        : true,
                    spaceId     : true,
                    dayModule   : {
                        select: {
                            day     : { select: { name: true } },
                            module  : { select: { startHour: true, endHour: true } },
                        }
                    }
                }
            });

            if ( existingSessions.length > 0 ) {
                const existing = existingSessions[0];
                const dayName  = existing.dayModule?.day?.name || 'Unknown';
                const timeRange = existing.dayModule 
                    ? `${existing.dayModule.module.startHour} - ${existing.dayModule.module.endHour}`
                    : 'Unknown';

                throw new Error(
                    `Conflict detected: Session ${existing.name} already exists on ${existing.date.toISOString().split( 'T' )[0]} ` +
                    `(${dayName}, ${timeRange}) in space ${existing.spaceId}. ` +
                    `Cannot create session ${session.name} at the same date and space.`
                );
            }
        }

        // Validar conflictos dentro del mismo array de sesiones a crear
        const sessionMap = new Map<string, any>();

        for ( const session of sessionsToCreate ) {
            if ( !session.spaceId ) {
                continue;
            }

            // Normalizar la fecha a medianoche para comparar solo el día
            const normalizedDate = new Date( session.date );

            normalizedDate.setHours( 0, 0, 0, 0 );

            // Incluir dayModuleId en la clave para permitir múltiples sesiones en el mismo día pero diferentes módulos
            const key = `${normalizedDate.toISOString()}_${session.dayModuleId}_${session.spaceId}`;
            
            if ( sessionMap.has( key ) ) {
                const conflicting = sessionMap.get( key );
                throw new Error(
                    `Conflict detected in request: Multiple sessions (${conflicting.name} and ${session.name}) ` +
                    `are scheduled for the same date ${normalizedDate.toISOString().split( 'T' )[0]} ` +
                    `and space ${session.spaceId}.`
                );
            }

            sessionMap.set( key, session );
        }
    }


    async findAll() {
        const sessions = await this.session.findMany({
            select: SELECT_SESSION,
            // where : {
            //     createdAt: {
            //         gte: new Date( new Date().setDate( new Date().getDate() - 7 ) ),
            //     }
            // }
        });

        if ( sessions?.length === 0 ) return [];

        return sessions.map( this.convertToSessionDto );
    }


    async findOne( id: string ) {
        const session = await this.session.findUnique({
            where   : { id },
            select  : SELECT_SESSION,
        });

        if ( !session ) {
            throw new NotFoundException( `Session with id ${id} not found` );
        }

        return this.convertToSessionDto( session );
    }


    async findBySectionId( sectionId : string ) {
        const session = await this.session.findMany({
            where: { sectionId },
            select: SELECT_SESSION,
        });

        if ( session.length === 0 ) return [];

        return session.map( this.convertToSessionDto );
    }


    async update( id: string, updateSessionDto: UpdateSessionDto ) {
        try {
            // 1. Obtener la sesión actual con todos los datos necesarios
            const currentSession = await this.session.findUnique({
                where   : { id },
                select  : {
                    id          : true,
                    date        : true,
                    dayModuleId : true,
                    spaceId     : true,
                    professorId : true,
                    section     : {
                        select : {
                            quota       : true,
                            registered  : true
                        }
                    }
                }
            });

            if ( !currentSession ) {
                throw new NotFoundException( `Session with id ${ id } not found` );
            }

            // 2. Determinar los valores finales después del update
            const finalDate         = updateSessionDto.date         !== undefined ? updateSessionDto.date           : currentSession.date;
            const finalDayModuleId  = updateSessionDto.dayModuleId  !== undefined ? updateSessionDto.dayModuleId    : currentSession.dayModuleId;
            const finalSpaceId      = updateSessionDto.spaceId      !== undefined ? updateSessionDto.spaceId        : currentSession.spaceId;
            const finalProfessorId  = updateSessionDto.professorId  !== undefined ? updateSessionDto.professorId    : currentSession.professorId;

            // 3. Validar cambios de fecha y/o dayModuleId
            const dateChanged       = updateSessionDto.date         !== undefined && updateSessionDto.date.getTime()    !== currentSession.date.getTime();
            const dayModuleChanged  = updateSessionDto.dayModuleId  !== undefined && updateSessionDto.dayModuleId       !== currentSession.dayModuleId;

            if ( dateChanged || dayModuleChanged ) {
                // Si cambia la fecha o el módulo, validar que el spaceId actual (o nuevo) esté disponible
                if ( finalSpaceId ) {
                    const spaceConflict = await this.session.findFirst({
                        where: {
                            date        : finalDate,
                            dayModuleId : finalDayModuleId,
                            spaceId     : finalSpaceId,
                            id          : { not: id }
                        }
                    });

                    if ( spaceConflict ) {
                        throw new BadRequestException( 
                            `El espacio ${finalSpaceId} ya está reservado para la fecha ${finalDate.toISOString().split('T')[0]} y el módulo especificado` 
                        );
                    }
                }

                // Si cambia la fecha o el módulo, validar que el professorId actual (o nuevo) esté disponible
                if ( finalProfessorId ) {
                    const professorConflict = await this.session.findFirst({
                        where: {
                            date        : finalDate,
                            dayModuleId : finalDayModuleId,
                            professorId : finalProfessorId,
                            id          : { not: id }
                        }
                    });

                    if ( professorConflict ) {
                        throw new BadRequestException( 
                            `El profesor ya tiene asignada otra sesión para la fecha ${finalDate.toISOString().split('T')[0]} y el módulo especificado` 
                        );
                    }
                }
            }

            // 4. Validar cambio de professorId
            if ( updateSessionDto.professorId !== undefined && updateSessionDto.professorId !== currentSession.professorId ) {
                const professorConflict = await this.session.findFirst({
                    where: {
                        date        : finalDate,
                        dayModuleId : finalDayModuleId,
                        professorId : updateSessionDto.professorId,
                        id          : { not: id }
                    }
                });

                if ( professorConflict ) {
                    throw new BadRequestException( 
                        `El profesor ya tiene asignada otra sesión para la fecha ${ finalDate.toISOString().split( 'T' )[0] } y el módulo especificado` 
                    );
                }
            }

            // 5. Validar cambio de spaceId y calcular chairsAvailable
            let dataToUpdate = { ...updateSessionDto };

            if ( updateSessionDto.spaceId !== undefined && updateSessionDto.spaceId !== currentSession.spaceId ) {
                const allSpaces = await this.spacesService.getSpaces();
                const spacesMap = new Map( allSpaces.map( space => [space.name, space] ));
                const space     = spacesMap.get( updateSessionDto.spaceId );

                if ( !space ) {
                    throw new BadRequestException( `El espacio ${updateSessionDto.spaceId} no existe o no está disponible` );
                }

                // Validar conflicto de espacio en la fecha/módulo final
                const spaceConflict = await this.session.findFirst({
                    where: {
                        date        : finalDate,
                        dayModuleId : finalDayModuleId,
                        spaceId     : updateSessionDto.spaceId,
                        id          : { not: id }
                    }
                });

                if ( spaceConflict ) {
                    throw new BadRequestException( 
                        `El espacio ${updateSessionDto.spaceId} ya está reservado para la fecha ${finalDate.toISOString().split('T')[0]} y el módulo especificado` 
                    );
                }

                const quota           = currentSession.section?.registered || currentSession.section?.quota;
                const chairsAvailable = space.capacity - quota;

                dataToUpdate = {
                    ...dataToUpdate,
                    chairsAvailable : chairsAvailable
                };
            }

            // 6. Realizar el update
            const session = await this.session.update({
                where   : { id },
                data    : dataToUpdate,
                select  : SELECT_SESSION,
            });

            return this.convertToSessionDto( session );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update session' );
        }
    }


    async updateSessionTimes(
        spaceId: string,
        updateSessionTimesDtos: UpdateMultipleSessionTimesDto[],
        isNegativeChairs: boolean = false
    ): Promise<SectionSession[]> {
        try {
            // 1. Extract all sessionIds and validate input
            const sessionIds = updateSessionTimesDtos.map(dto => dto.sessionId);

            if (sessionIds.length === 0) {
                throw new BadRequestException('No se recibieron sesiones para actualizar');
            }

            // Check for duplicate sessionIds in the request
            const uniqueSessionIds = new Set(sessionIds);
            if (uniqueSessionIds.size !== sessionIds.length) {
                throw new BadRequestException('Hay IDs de sesión duplicados en la solicitud');
            }

            // 2. Fetch all sessions from database
            const sessions = await this.session.findMany({
                where: {
                    id: { in: sessionIds }
                },
                select: {
                    id: true,
                    date: true,
                    dayModuleId: true,
                    spaceId: true,
                    professorId: true,
                    section: {
                        select: {
                            id: true,
                            quota: true,
                            registered: true,
                            startDate: true,
                            endDate: true
                        }
                    }
                }
            });

            // Validate all sessions exist
            if (sessions.length !== sessionIds.length) {
                throw new NotFoundException(
                    `No se encontraron todas las sesiones. Se esperaban ${sessionIds.length} pero se encontraron ${sessions.length}`
                );
            }

            // Create a map for quick session lookup
            const sessionMap = new Map(sessions.map(s => [s.id, s]));

            // 3. Get all spaces once
            const allSpaces = await this.spacesService.getSpaces();
            const spacesMap = new Map(allSpaces.map(space => [space.name, space]));

            // Validate that the spaceId exists
            const space = spacesMap.get(spaceId);
            if (!space) {
                throw new NotFoundException(`El espacio ${spaceId} no existe o no está disponible`);
            }

            if (!space.active) {
                throw new BadRequestException(`El espacio ${spaceId} está inactivo`);
            }

            // 4. Process each session and prepare updates
            const sessionUpdates: Array<{
                sessionId: string;
                newDate: Date;
                newDayModuleId: number;
                newSpaceId: string;
                chairsAvailable: number;
            }> = [];

            // Collect all unique dayModuleIds that we need to fetch
            const dayModuleIds = new Set<number>();
            for (const dto of updateSessionTimesDtos) {
                dayModuleIds.add(dto.dayModuleId);
            }

            // Fetch all dayModules at once
            const dayModules = await this.dayModule.findMany({
                where: {
                    id: { in: Array.from(dayModuleIds) }
                },
                select: {
                    id: true,
                    dayId: true,
                    day: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    module: {
                        select: {
                            id: true,
                            code: true,
                            startHour: true,
                            endHour: true,
                            difference: true
                        }
                    }
                }
            });

            const dayModuleMap = new Map(dayModules.map(dm => [dm.id, dm]));

            // Validate all dayModules exist
            for (const dayModuleId of dayModuleIds) {
                if (!dayModuleMap.has(dayModuleId)) {
                    throw new NotFoundException(`DayModule with id ${dayModuleId} not found`);
                }
            }

            // 5. Process each session update
            for (const dto of updateSessionTimesDtos) {
                const currentSession = sessionMap.get(dto.sessionId)!;
                const newDayModuleId = dto.dayModuleId;
                const dayModule = dayModuleMap.get(newDayModuleId)!;

                let newDate: Date;
                let needsDateRecalculation = false;

                // Check if dayModuleId changed
                if (currentSession.dayModuleId !== newDayModuleId) {
                    needsDateRecalculation = true;
                    
                    // Calculate new date within the same week
                    const currentDate = new Date(currentSession.date);
                    const currentDayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                    const currentISODay = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
                    const newISODay = dayModule.dayId;
                    const dayDifference = newISODay - currentISODay;
                    
                    newDate = new Date(currentDate);
                    newDate.setDate(currentDate.getDate() + dayDifference);
                } else {
                    // dayModuleId hasn't changed, keep the same date
                    newDate = currentSession.date;
                }

                // Calculate chairsAvailable
                const quota = currentSession.section.registered || currentSession.section.quota;
                const chairsAvailable = space.capacity - quota;

                // Check if spaceId is changing
                const spaceIdChanged = currentSession.spaceId !== spaceId;

                // Validate isNegativeChairs only when spaceId is changing
                if (spaceIdChanged && chairsAvailable < 0 && !isNegativeChairs) {
                    throw new BadRequestException(
                        `El espacio ${spaceId} no tiene capacidad suficiente para la sesión ${dto.sessionId}. ` +
                        `Capacidad: ${space.capacity}, Requerido: ${quota}, Disponible: ${chairsAvailable}`
                    );
                }

                sessionUpdates.push({
                    sessionId: dto.sessionId,
                    newDate,
                    newDayModuleId,
                    newSpaceId: spaceId,
                    chairsAvailable
                });
            }

            // 6. Validate space availability for all sessions (excluding the sessions being updated)
            for (const update of sessionUpdates) {
                const currentSession = sessionMap.get(update.sessionId)!;
                
                // Skip validation if both dayModuleId and spaceId haven't changed
                if (currentSession.dayModuleId === update.newDayModuleId && 
                    currentSession.spaceId === update.newSpaceId) {
                    continue;
                }

                const spaceConflict = await this.session.findFirst({
                    where: {
                        date: update.newDate,
                        dayModuleId: update.newDayModuleId,
                        spaceId: update.newSpaceId,
                        id: { notIn: sessionIds } // Exclude all sessions being updated
                    },
                    select: { id: true }
                });

                if (spaceConflict) {
                    throw new BadRequestException(
                        `El espacio ${update.newSpaceId} ya está reservado para la fecha ${update.newDate.toISOString().split('T')[0]} ` +
                        `y el módulo especificado (sesión ${update.sessionId})`
                    );
                }
            }

            // 7. Validate professor availability for sessions where dayModuleId changed
            for (const update of sessionUpdates) {
                const currentSession = sessionMap.get(update.sessionId)!;
                
                // Skip if dayModuleId hasn't changed or session has no professor
                if (currentSession.dayModuleId === update.newDayModuleId || !currentSession.professorId) {
                    continue;
                }

                const professorConflict = await this.session.findFirst({
                    where: {
                        date: update.newDate,
                        dayModuleId: update.newDayModuleId,
                        professorId: currentSession.professorId,
                        id: { notIn: sessionIds } // Exclude all sessions being updated
                    },
                    select: { id: true }
                });

                if (professorConflict) {
                    throw new BadRequestException(
                        `El profesor ya tiene asignada otra sesión para la fecha ${update.newDate.toISOString().split('T')[0]} ` +
                        `y el módulo especificado (sesión ${update.sessionId})`
                    );
                }
            }

            // 8. Update all sessions in a transaction
            await this.$transaction(async (prisma) => {
                for (const update of sessionUpdates) {
                    await prisma.session.update({
                        where: { id: update.sessionId },
                        data: {
                            spaceId: update.newSpaceId,
                            dayModuleId: update.newDayModuleId,
                            date: update.newDate,
                            chairsAvailable: update.chairsAvailable
                        }
                    });
                }
            });

            // 9. Fetch all updated sessions with full relations
            const updatedSessions = await this.session.findMany({
                where: { id: { in: sessionIds } },
                select: {
                    id: true,
                    name: true,
                    spaceId: true,
                    isEnglish: true,
                    chairsAvailable: true,
                    date: true,
                    dayModuleId: true,
                    professor: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    dayModule: {
                        select: {
                            id: true,
                            dayId: true,
                            module: {
                                select: {
                                    id: true,
                                    code: true,
                                    startHour: true,
                                    endHour: true,
                                    difference: true
                                }
                            }
                        }
                    },
                    section: {
                        select: {
                            id: true,
                            code: true,
                            isClosed: true,
                            startDate: true,
                            endDate: true,
                            quota: true,
                            registered: true,
                            subject: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            },
                            period: {
                                select: {
                                    id: true,
                                    name: true,
                                    startDate: true,
                                    endDate: true,
                                    openingDate: true,
                                    closingDate: true
                                }
                            }
                        }
                    }
                }
            });

            // 10. Map to SectionSession[] response
            const responses: SectionSession[] = updatedSessions.map(updatedSession => ({
                id: updatedSession.section.id,
                code: updatedSession.section.code,
                isClosed: updatedSession.section.isClosed,
                startDate: updatedSession.section.startDate,
                endDate: updatedSession.section.endDate,
                subject: {
                    id: updatedSession.section.subject.id,
                    name: updatedSession.section.subject.name
                },
                period: {
                    id: updatedSession.section.period.id,
                    name: updatedSession.section.period.name,
                    startDate: updatedSession.section.period.startDate,
                    endDate: updatedSession.section.period.endDate,
                    openingDate: updatedSession.section.period.openingDate,
                    closingDate: updatedSession.section.period.closingDate
                },
                quota: updatedSession.section.quota,
                registered: updatedSession.section.registered ?? 0,
                session: {
                    id: updatedSession.id,
                    name: updatedSession.name as any,
                    spaceId: updatedSession.spaceId,
                    isEnglish: updatedSession.isEnglish,
                    chairsAvailable: updatedSession.chairsAvailable ?? 0,
                    professor: updatedSession.professor ? {
                        id: updatedSession.professor.id,
                        name: updatedSession.professor.name
                    } : null,
                    module: {
                        id: updatedSession.dayModule.module.id.toString(),
                        code: updatedSession.dayModule.module.code || '',
                        name: `M${updatedSession.dayModule.module.code}${updatedSession.dayModule.module.difference ? `-${updatedSession.dayModule.module.difference}` : ''} ${updatedSession.dayModule.module.startHour}-${updatedSession.dayModule.module.endHour}`,
                        startHour: updatedSession.dayModule.module.startHour,
                        endHour: updatedSession.dayModule.module.endHour,
                        difference: updatedSession.dayModule.module.difference as any
                    },
                    date: updatedSession.date,
                    dayId: updatedSession.dayModule.dayId,
                    dayModuleId: updatedSession.dayModuleId
                }
            }));

            return responses;
        } catch (error) {
            throw PrismaException.catch(error, 'Failed to update session times');
        }
    }


	async massiveUpdate( updateSectionDto: MassiveUpdateSessionDto ) {
		try {
			const { ids, professorId, spaceId, ...otherData } = updateSectionDto;

			if ( Object.keys( otherData ).length === 0 && !professorId && !spaceId ) {
				throw new BadRequestException( 'No data to update' );
			}

			// 1. Update normal fields (without professorId and spaceId)
			if ( Object.keys( otherData ).length > 0 ) {
				await this.session.updateMany({
					where	: { id: { in: ids }},
					data	: otherData
				});
			}

			// Get current sessions info for validation (needed for professor and/or space)
			let currentSessions;

			if ( professorId || spaceId ) {
				currentSessions = await this.session.findMany({
					where	: { id: { in: ids }},
					select	: {
						id          : true,
						date        : true,
						dayModuleId : true,
						professorId : true,
						spaceId     : true,
						section     : {
							select : {
								quota : true,
                                registered: true
							}
						}
					}
				});
			}

			// 2. Update professorId only if it comes in the DTO
			if ( professorId ) {
				// Find sessions where the new professor is already assigned
				const professorSessions = await this.session.findMany({
					where: {
						professorId	: professorId,
						date		: { in: currentSessions.map( s => s.date ) },
						dayModuleId	: { in: currentSessions.map( s => s.dayModuleId! ) }
					},
					select: { id: true, date: true, dayModuleId: true }
				});

				// Filter sessions that CAN be updated
				const sessionIdsToUpdate: string[] = [];

				for ( const currentSession of currentSessions ) {
					// If it already has the same professor, skip
					if ( currentSession.professorId === professorId ) {
						continue;
					}

					// Check if the professor has a conflict in this date/dayModuleId
					const hasConflict = professorSessions.find( ps => 
						ps.date.getTime() === currentSession.date.getTime() && 
						ps.dayModuleId === currentSession.dayModuleId
					);

					if ( hasConflict ) {
						continue;
					}

					// Professor available, add to the list
					sessionIdsToUpdate.push( currentSession.id );
				}

				// Update only valid sessions
				if ( sessionIdsToUpdate.length > 0 ) {
					await this.session.updateMany({
						where	: { id: { in: sessionIdsToUpdate }},
						data	: { professorId }
					});
				}
			}

			// 3. Update spaceId only if it comes in the DTO
			if ( spaceId ) {
				const allSpaces = await this.spacesService.getSpaces();
				const spacesMap = new Map( allSpaces.map( space => [space.name, space] ));

				const space = spacesMap.get( spaceId );

				if ( !space ) {
					throw new BadRequestException( `El espacio ${spaceId} no existe o no está disponible` );
				}

				// Find sessions where the new space is already occupied
				const spaceSessions = await this.session.findMany({
					where: {
						spaceId		: spaceId,
						date		: { in: currentSessions.map( s => s.date ) },
						dayModuleId	: { in: currentSessions.map( s => s.dayModuleId ) }
					},
					select: { id: true, date: true, dayModuleId: true }
				});

				// Filter sessions that CAN be updated
				const sessionIdsToUpdate: string[] = [];

				for ( const currentSession of currentSessions ) {
					// If it already has the same space, skip
					if ( currentSession.spaceId === spaceId ) {
						continue;
					}

					// Check if the space has a conflict in this date/dayModuleId
					const hasConflict = spaceSessions.find( ss => 
						ss.date.getTime() === currentSession.date.getTime() && 
						ss.dayModuleId === currentSession.dayModuleId
					);

					if ( hasConflict ) {
						continue;
					}
					// Space available, add to the list
					sessionIdsToUpdate.push( currentSession.id );
				}

				// Update only valid sessions
				if ( sessionIdsToUpdate.length > 0 ) {
					// Validar que todas las sesiones a actualizar compartan la misma quota
					const quotas = Array.from(
						new Set(
							currentSessions
								.filter( session => sessionIdsToUpdate.includes( session.id ))
								.map( session => session.section?.registered || session.section?.quota )
						)
					);

					if ( quotas.length > 1 ) {
						throw new BadRequestException( 'No se puede actualizar masivamente espacios con distintas quotas de sección' );
					}

					const quota           = Number( quotas[0] || 0 );
					const chairsAvailable = space.capacity - quota;

					await this.session.updateMany({
						where	: { id: { in: sessionIdsToUpdate }},
						data	: {
							spaceId			: spaceId,
							chairsAvailable : chairsAvailable
						}
					});
				}
			}

			// 4. Return all updated sessions
			const sessionsData = await this.session.findMany({
				select	: SELECT_SESSION,
				where	: { id: { in: ids }}
			});

			return sessionsData.map( session => this.convertToSessionDto( session ));
		} catch ( error ) {
			console.error( 'Error updating section:', error );
			throw PrismaException.catch( error, 'Failed to update section' );
		}
	}


    remove( id: string ) {
		try {
			return this.session.delete({
				where: { id }
			});
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to delete session' );
		}
	}


	massiveRemove( ids: string[] ) {
		try {
			return this.session.deleteMany({
				where: { id: { in: ids }}
			});
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to delete sessions' );
		}
	}


    async generateReportSectionSessionRegistered() {
        const sections = await this.section.findMany({
            select : {
                id          : true,
                code        : true,
                building    : true,
                spaceType   : true,
                quota       : true,
                registered  : true,
                subject     : {
                    select: {
                        id      : true,
                        name    : true
                    }
                },
                period      : {
                    select: {
                        id      : true,
                        type    : true,
                        name    : true
                    }
                },
                spaceSize   : {
                    select: {
                        id      : true,
                        detail  : true
                    }
                },
            },
        });

        const rows = sections.map( section => ({
            SectionId           : section.id,
            SSEC                : `${section.subject.id}-${section.code}`,
            NombreAsignatura    : section.subject.name,
            Periodo             : `${section.period.id}-${section.period.name}`,
            TipoPeriodo         : section.period.type,
            Edificio            : section.building ?? null,
            TipoEspacio         : section.spaceType ?? null,
            TamanoEspacio       : section.spaceSize ? `${section.spaceSize.id}-${section.spaceSize.detail}` : null,
            Cupos               : section.quota,
            InscritosActuales   : section.registered,
            Inscritos           : '',
        }));

        // 3. Definir el orden y nombre de las columnas
        const headers: string[] = [
            'SectionId',
            'SSEC',
            'NombreAsignatura',
            'Periodo',
            'TipoPeriodo',
            'Edificio',
            'TipoEspacio',
            'TamanoEspacio',
            'Cupos',
            'InscritosActuales',
            'Inscritos',
        ];

        // 4. Crear el Excel
        const worksheet = XLSX.utils.json_to_sheet( rows, { header: headers });
        const workbook  = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet( workbook, worksheet, 'Sesiones' );

        const metaSheet = XLSX.utils.aoa_to_sheet([  
            ['type', 'registered'],  
            ['generatedAt', new Date().toISOString()]  
        ]);

        XLSX.utils.book_append_sheet( workbook, metaSheet, '_meta' );

        // 5. Generar el buffer del archivo
        const excelBuffer = XLSX.write( workbook, {
            type        : 'buffer',
            bookType    : 'xlsx'
        });

        return excelBuffer;
    }


    async exportSessionsWithoutAssignment( type: Type ) {
        if ( type === Type.REGISTERED ) {
            return this.generateReportSectionSessionRegistered();
        }

        // 1. Buscar las secciones abiertas con sesiones sin asignación
        const sections = await this.section.findMany({
            select : {
                id          : true,
                code        : true,
                building    : true,
                spaceType   : true,
                quota       : true,
                subject     : {
                    select: {
                        id      : true,
                        name    : true
                    }
                },
                period      : {
                    select: {
                        id      : true,
                        type    : true,
                        name    : true
                    }
                },
                spaceSize   : {
                    select: {
                        id      : true,
                        detail  : true
                    }
                },
                sessions    : {
                    // where:
                    //     type === Type.SPACE
                    //         ? { spaceId: null }
                    //         : { professorId: null },
                    select: {
                        id          : true,
                        name        : true,
                        spaceId     : true,
                        date        : true,
                        professor : {
                            select: {
                                id      : true,
                                name    : true
                            }
                        },
                        dayModule   : {
                            select: {
                                dayId   : true,
                                module  : {
                                    select: {
                                        code: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });

        const rows = sections.flatMap( section => section.sessions.map( session => ({
            SSEC                : `${section.subject.id}-${section.code}`,
            SesionId            : session.id,
            Numero              : section.code,
            NombreAsignatura    : section.subject.name,
            Fecha               : session.date,
            Dia                 : session.dayModule?.dayId ?? null,
            Modulo              : session.dayModule?.module?.code ?? null,
            Periodo             : `${section.period.id}-${section.period.name}`,
            TipoPeriodo         : section.period.type,
            Edificio            : section.building  ?? null,
            TipoEspacio         : section.spaceType ?? null,
            TamanoEspacio       : section.spaceSize ? `${section.spaceSize.id}-${section.spaceSize.detail}` : null,
            TipoSesion          : session.name,
            Cupos               : section.quota,
            ...( type === Type.SPACE ? {
                Profesor        : session.professor ? `${session.professor.id}-${session.professor.name}` : null,
                EspacioActual   : session.spaceId,
                Espacio         : null,
            } : {
                Espacio         : session.spaceId ?? null,
                ProfesorActual  : session.professor ? `${session.professor.id}-${session.professor.name}` : null,
                Profesor        : null,
            }),
        })));

        // 3. Definir el orden y nombre de las columnas
        const headers: string[] = [
            'SSEC',
            'SesionId',
            'Numero',
            'NombreAsignatura',
            'Fecha',
            'Dia',
            'Modulo',
            'Periodo',
            'TipoPeriodo',
            'Edificio',
            'TipoEspacio',
            'TamanoEspacio',
            'TipoSesion',
            'Cupos',
            ...( type === Type.SPACE ? [ 'Profesor', 'EspacioActual', 'Espacio'] : [ 'Espacio', 'ProfesorActual', 'Profesor'] )
        ];

        // 4. Crear el Excel
        const worksheet = XLSX.utils.json_to_sheet( rows, { header: headers });
        const workbook  = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet( workbook, worksheet, 'Sesiones' );

        const metaSheet = XLSX.utils.aoa_to_sheet([  
            ['type', type],  
            ['generatedAt', new Date().toISOString()]  
        ]);

        XLSX.utils.book_append_sheet( workbook, metaSheet, '_meta' );

        // 5. Generar el buffer del archivo
        const excelBuffer = XLSX.write( workbook, {
            type        : 'buffer',
            bookType    : 'xlsx'
        });

        return excelBuffer;
    }

    /**
     * Calculate registered preview for sections
     * Returns ExcelSessionDto[] with Estado and Detalle for user review
     * Also returns ExcelSectionDto[] with aggregated Estado and Detalle
     */
    async #calculateRegisteredPreview(
        sectionDataList : SectionDataDto[]
    ): Promise<AssignmentDto> {
        // 1. Create map of unique sections
        const uniqueSectionsMap = new Map<string, SectionDataDto>();

        for ( const item of sectionDataList ) {
            if ( !uniqueSectionsMap.has( item.sectionId )) {
                uniqueSectionsMap.set( item.sectionId, item );
            }
        }

        const sectionIds = Array.from( uniqueSectionsMap.keys() );

        if ( sectionIds.length === 0 ) {
            return {
                type        : Type.REGISTERED,
                data        : [],
                sections    : []
            };
        }

        // 2. Get all sessions for these sections
        const sessions = await this.session.findMany({
            where   : { sectionId: { in: sectionIds }},
            select  : {
                id              : true,
                name            : true,
                date            : true,
                spaceId         : true,
                sectionId       : true,
                chairsAvailable : true,
                section         : {
                    select: {
                        id          : true,
                        code        : true,
                        quota       : true,
                        registered  : true,
                        building    : true,
                        spaceType   : true,
                        subject     : {
                            select: {
                                id      : true,
                                name    : true
                            }
                        },
                        period      : {
                            select: {
                                id      : true,
                                name    : true,
                                type    : true
                            }
                        },
                        spaceSize   : {
                            select: {
                                id      : true,
                                detail  : true
                            }
                        }
                    }
                },
                professor   : {
                    select: {
                        id      : true,
                        name    : true
                    }
                },
                dayModule   : {
                    select: {
                        dayId   : true,
                        module  : {
                            select: {
                                code        : true,
                                startHour   : true,
                                endHour     : true,
                                difference  : true
                            }
                        }
                    }
                }
            }
        });

        // 3. Get all spaces from service
        const allSpaces  = await this.spacesService.getSpaces();
        const spacesMap  = new Map( allSpaces.map( space => [space.name, space] ));

        // 4. Create registered map
        const registeredMap = new Map<string, number>();

        for ( const sectionId of sectionIds ) {
            const inputData = uniqueSectionsMap.get( sectionId );

            if ( inputData ) {
                registeredMap.set( sectionId, inputData.registered );
            }
        }

        // 5. Process each session and calculate Estado and Detalle
        const results: ExcelSessionDto[] = [];
        // Map to track session statuses by sectionId for section-level aggregation
        const sectionStatusMap = new Map<string, Status[]>();

        for ( const session of sessions ) {
            const registered = registeredMap.get( session.sectionId );

             // Build common fields
            const module        = session.dayModule.module;
            const moduleStr     = `${ module.code } - ${ module.startHour } - ${ module.endHour }`;
            const SSEC          = `${ session.section.subject.id }-${ session.section.code }`;
            const periodo       = `${ session.section.period.id }-${ session.section.period.name }`;
            const tamanoEspacio = session.section.spaceSize ? session.section.spaceSize.id : null;
            const tamanoDetalle = session.section.spaceSize ? session.section.spaceSize.detail : null;
            const profesorStr   = session.professor ? `${ session.professor.id }-${ session.professor.name }` : null;

             // Calculate Estado and Detalle based on space capacity
            let status              : Status;
            let detail              : string;
            let availableCapacity   : number | null = null;

            if ( registered === undefined ) {
                status = Status.UNAVAILABLE;
                detail = 'Sin valor de inscritos.';

                results.push({
                    SSEC,
                    SesionId            : session.id,
                    SectionId           : session.sectionId,
                    Numero              : session.section.code,
                    NombreAsignatura    : session.section.subject.name,
                    Fecha               : session.date,
                    Dia                 : session.dayModule.dayId,
                    Modulo              : moduleStr,
                    Periodo             : periodo,
                    TipoPeriodo         : session.section.period.type,
                    Edificio            : session.section.building,
                    TipoEspacio         : session.section.spaceType,
                    TamanoEspacio       : tamanoEspacio,
                    TamanoDetalle       : tamanoDetalle,
                    TipoSesion          : session.name,
                    Cupos               : session.section.quota,
                    InscritosActuales   : session.section.registered,
                    Inscritos           : null,
                    SillasDisponibles   : availableCapacity,
                    Profesor            : profesorStr,
                    Espacio             : session.spaceId,
                    Estado              : status,
                    Detalle             : detail
                });

                // Track status for section aggregation
                if ( !sectionStatusMap.has( session.sectionId )) {
                    sectionStatusMap.set( session.sectionId, [] );
                }
                sectionStatusMap.get( session.sectionId )!.push( status );

                continue;
            }

            if ( !session.spaceId ) {
                status  = Status.AVAILABLE;
                detail  = 'Sin espacio asignado.';
            } else {
                const space = spacesMap.get( session.spaceId );

                if ( !space ) {
                    status  = Status.UNAVAILABLE;
                    detail  = `Espacio "${ session.spaceId }" no encontrado en el sistema.`;
                } else {
                    availableCapacity = space.capacity - registered;

                    if ( availableCapacity >= 0 ) {
                        status  = Status.AVAILABLE;
                        detail  = 'Válido para asignación.';

                        if ( (session.section.registered ?? 0 ) > 0 ){
                            detail  = `Se va modificar el valor de inscritos de ${session.section.registered} -> ${registered}`;
                        }
                    } else {
                        status  = Status.AVAILABLE;
                        detail  = 'Capacidad insuficiente.';

                        const registeredNumber = session.section.registered ?? 0;

                        if ( registeredNumber > 0 && registeredNumber !== registered ) {
                            detail  = `Capacidad insuficiente. Se va modificar el valor de inscritos de ${registeredNumber} -> ${registered}`;
                        }

                        if ( registeredNumber > 0 && registeredNumber === registered ) {
                            detail  = `Capacidad insuficiente. El valor de inscritos es el mismo.`;
                        }
                    }
                }
            }

            results.push({
                SSEC,
                SesionId            : session.id,
                SectionId           : session.sectionId,
                Numero              : session.section.code,
                NombreAsignatura    : session.section.subject.name,
                Fecha               : session.date,
                Dia                 : session.dayModule.dayId,
                Modulo              : moduleStr,
                Periodo             : periodo,
                TipoPeriodo         : session.section.period.type,
                Edificio            : session.section.building,
                TipoEspacio         : session.section.spaceType,
                TamanoEspacio       : tamanoEspacio,
                TamanoDetalle       : tamanoDetalle,
                TipoSesion          : session.name,
                Cupos               : session.section.quota,
                InscritosActuales   : session.section.registered,
                Inscritos           : registered,
                SillasDisponibles   : availableCapacity,
                Profesor            : profesorStr,
                Espacio             : session.spaceId,
                Estado              : status,
                Detalle             : detail
            });

            // Track status for section aggregation
            if ( !sectionStatusMap.has( session.sectionId )) {
                sectionStatusMap.set( session.sectionId, [] );
            }
            sectionStatusMap.get( session.sectionId )!.push( status );
        }

        // 6. Build unique sections array with aggregated Estado and Detalle
        const uniqueSectionsSet = new Set<string>();
        const sectionsResult: ExcelSectionDto[] = [];

        for ( const session of sessions ) {
            if ( uniqueSectionsSet.has( session.sectionId )) {
                continue;
            }

            uniqueSectionsSet.add( session.sectionId );

            const registered        = registeredMap.get( session.sectionId ) ?? session.section.registered ?? 0;
            const SSEC              = `${ session.section.subject.id }-${ session.section.code }`;
            const periodo           = `${ session.section.period.id }-${ session.section.period.name }`;
            const tamanoEspacio     = session.section.spaceSize ? session.section.spaceSize.id : '';
            const sessionStatuses   = sectionStatusMap.get( session.sectionId ) || [];

            // Calculate section-level Estado based on session statuses
            let sectionEstado: Status;
            const availableCount    = sessionStatuses.filter( s => s === Status.AVAILABLE ).length;
            const unavailableCount  = sessionStatuses.filter( s => s === Status.UNAVAILABLE ).length;
            const totalSessions     = sessionStatuses.length;

            if ( totalSessions === 0 ) {
                sectionEstado = Status.UNAVAILABLE;
            } else if ( unavailableCount === totalSessions ) {
                sectionEstado = Status.UNAVAILABLE;
            } else if ( availableCount === totalSessions ) {
                sectionEstado = Status.AVAILABLE;
            } else {
                sectionEstado = Status.PROBABLE;
            }

            // Calculate section-level Detalle
            let sectionDetalle: string;

            if ( unavailableCount === 0 ) {
                sectionDetalle = 'Todas las sesiones disponibles';
            } else if ( unavailableCount === totalSessions ) {
                sectionDetalle = `Existen ${unavailableCount} errores`;
            } else {
                sectionDetalle = `${availableCount} sesiones disponibles, ${unavailableCount} sesiones no disponibles`;
            }

            if ( session.section.registered ) {
                sectionDetalle = `Se va modificar el valor de inscritos de ${session.section.registered} -> ${registered}`;
            }

            if ( session.section.registered === registered ) {
                sectionDetalle = `El valor de inscritos es el mismo.`;
            }

            sectionsResult.push({
                SectionId           : session.sectionId,
                SSEC                : SSEC,
                NombreAsignatura    : session.section.subject.name,
                Periodo             : periodo,
                TipoPeriodo         : session.section.period.type,
                Edificio            : session.section.building  || '',
                TipoEspacio         : session.section.spaceType || '',
                TamanoEspacio       : tamanoEspacio,
                Cupos               : session.section.quota,
                InscritosActuales   : session.section.registered,
                Inscritos           : registered,
                Estado              : sectionEstado,
                Detalle             : sectionDetalle
            });
        }

        return {
            type        : Type.REGISTERED,
            data        : results,
            sections    : sectionsResult
        };
    }

    /**
     * Public method to assign registered values to sections
     * This performs the actual database updates
     */
    async assignRegistered( assignSessionRegisteredList: AssignSessionRegisteredDto[] ) {
        return this.#calculateRegistered( assignSessionRegisteredList );
    }


    #calculateRegistered(
        assignSessionRegisteredList : AssignSessionRegisteredDto[]
    ) {
        return this.$transaction( async prisma => {
            try {
                // 1. Create map of unique sections with their registered values
                const uniqueSectionsMap = new Map<string, number>();

                for ( const item of assignSessionRegisteredList ) {
                    if ( !uniqueSectionsMap.has( item.sectionId )) {
                        uniqueSectionsMap.set( item.sectionId, item.registered );
                    }
                }

                const sectionIds = Array.from( uniqueSectionsMap.keys() );

                if ( sectionIds.length === 0 ) {
                    return [];
                }

                // 2. Verify sections exist
                const sections = await prisma.section.findMany({
                    where   : { id: { in: sectionIds }},
                    select  : { id: true }
                });

                if ( sections.length === 0 ) {
                    return [];
                }

                // 3. Update all sections in parallel using Promise.all
                const sectionUpdatePromises = sections.map( section => {
                    const registered = uniqueSectionsMap.get( section.id );

                    if ( registered === undefined ) {
                        return Promise.resolve();
                    }

                    return prisma.section.update({
                        where   : { id: section.id },
                        data    : { registered }
                    });
                });

                await Promise.all( sectionUpdatePromises );

                // 4. Get all sessions for these sections
                const sessions = await prisma.session.findMany({
                    where   : { sectionId: { in: sectionIds }},
                    select  : {
                        id          : true,
                        sectionId   : true,
                        spaceId     : true,
                    }
                });

                // 5. Get all spaces and create maps
                const allSpaces      = await this.spacesService.getSpaces();
                const spacesMap      = new Map( allSpaces.map( space => [space.name, space] ));
                const registeredMap  = new Map<string, number>();

                for ( const section of sections ) {
                    const registered = uniqueSectionsMap.get( section.id );

                    if ( registered !== undefined ) {
                        registeredMap.set( section.id, registered );
                    }
                }

                // 6. Group sessions by (spaceId, registered) for optimized updateMany
                const groupedSessions = new Map<string, string[]>();

                for ( const session of sessions ) {
                    // Ignorar sesiones sin espacio asignado
                    if ( !session.spaceId ) continue;

                    const registered = registeredMap.get( session.sectionId );

                    if ( registered === undefined ) continue;

                    // Crear clave única para agrupar: "spaceId|registered"
                    const key = `${ session.spaceId }|${ registered }`;

                    if ( !groupedSessions.has( key )) {
                        groupedSessions.set( key, [] );
                    }

                    groupedSessions.get( key )!.push( session.id );
                }

                // 7. Update sessions using updateMany for each group
                const sessionUpdatePromises = Array.from( groupedSessions.entries() )
                    .filter(([key]) => {
                        const [spaceId] = key.split( '|' );
                        const space     = spacesMap.get( spaceId );
                        // Solo procesar si el espacio existe en el mapa
                        return space !== undefined;
                    })
                    .map(([key, sessionIds]) => {
                        const [spaceId, registeredStr]  = key.split( '|' );
                        const registered                = parseInt( registeredStr );
                        const space                     = spacesMap.get( spaceId )!;
                        const chairsAvail               = space.capacity - registered;

                        return prisma.session.updateMany({
                            where   : { id: { in: sessionIds }},
                            data    : { chairsAvailable: chairsAvail }
                        });
                    });

                await Promise.all( sessionUpdatePromises );

                // 8. Get updated sections
                const updatedSections = await prisma.section.findMany({
                    where   : { id: { in: sectionIds }},
                    select  : SELECT_SECTION,
                });

                return updatedSections.map( section => this.#convertToSectionDto( section ));
            } catch ( error ) {
                throw PrismaException.catch( error, 'Failed to calculate registered' );
            }
        });
    }


    async calculateSessionAvailabilitySpaceOrProfessorOrRegister(
        type            : Type,
        sessionDataList : SessionDataDto[] | SectionDataDto[]
    ): Promise<AssignmentDto> {
        try {
            if ( type === Type.REGISTERED ) {
                return this.#calculateRegisteredPreview( sessionDataList as SectionDataDto[] );
            }

            // 1. Extraer todos los sessionIds
            const sessionIds = sessionDataList
                .map( data => data.sessionId )
                .filter( Boolean );

            if ( sessionIds.length === 0 ) {
                throw new BadRequestException( 'No se encontraron sessionIds válidos' );
            }

            // 2. Obtener todas las sesiones de una sola vez (optimización)
            const sessions = await this.session.findMany({
                where: {
                    id: { in: sessionIds }
                },
                select: {
                    id          : true,
                    name        : true,
                    date        : true,
                    spaceId     : true,
                    professorId : true,
                    dayModuleId : true,
                    section     : {
                        select: {
                            code        : true,
                            quota       : true,
                            registered  : true,
                            building    : true,
                            spaceType   : true,
                            subject     : {
                                select: {
                                    id      : true,
                                    name    : true
                                }
                            },
                            period      : {
                                select: {
                                    id      : true,
                                    name    : true,
                                    type    : true
                                }
                            },
                            spaceSize   : {
                                select: {
                                    id      : true,
                                    detail  : true
                                }
                            }
                        }
                    },
                    professor   : {
                        select: {
                            id      : true,
                            name    : true
                        }
                    },
                    dayModule   : {
                        select: {
                            dayId   : true,
                            module  : {
                                select: {
                                    code        : true,
                                    startHour   : true,
                                    endHour     : true,
                                    difference  : true
                                }
                            }
                        }
                    }
                }
            });

            // Crear un mapa para acceso rápido
            const sessionMap = new Map( sessions.map( s => [ s.id, s ]));

            // 3. Si es tipo 'space', obtener todos los espacios del servicio externo
            let allSpaces: Space[] = [];

            if ( type === Type.SPACE ) {
                allSpaces = await this.spacesService.getSpaces();
            }

            // 4. Si es tipo 'professor', obtener todos los profesores mencionados
            let professorMap = new Map<string, { id: string; name: string }>();

            if ( type === Type.PROFESSOR ) {
                const professorIds = sessionDataList
                    .map( data => data.professor?.id )
                    .filter( Boolean ) as string[];

                const uniqueProfessorIds = [...new Set( professorIds )];

                if ( uniqueProfessorIds.length > 0 ) {
                    const professors = await this.professor.findMany({
                        where: {
                            id: { in: uniqueProfessorIds }
                        },
                        select: {
                            id  : true,
                            name: true
                        }
                    });

                    professorMap = new Map( professors.map( p => [ p.id, { id: p.id, name: p.name }]));
                }
            }

            // 5. Procesar cada SessionDataDto
            const results: ExcelSessionDto[] = [];

            for ( const data of sessionDataList as SessionDataDto[] ) {
                const session = sessionMap.get( data.sessionId );

                if ( !session ) {
                    results.push({
                        SSEC                : 'UNKNOWN',
                        SesionId            : data.sessionId,
                        Numero              : 0,
                        NombreAsignatura    : 'UNKNOWN',
                        Fecha               : new Date(),
                        Dia                 : 0,
                        Modulo              : 'UNKNOWN',
                        Periodo             : 'UNKNOWN',
                        TipoPeriodo         : 'UNKNOWN',
                        Edificio            : null,
                        TipoEspacio         : null,
                        TamanoEspacio       : null,
                        TamanoDetalle       : null,
                        TipoSesion          : 'UNKNOWN',
                        Cupos               : 0,
                        Profesor            : null,
                        Espacio             : type === Type.SPACE ? ( data.spaceId || null ) : null,
                        Estado              : Status.UNAVAILABLE,
                        Detalle             : `Sesión con ID ${ data.sessionId } no encontrada en la base de datos`
                    });

                    continue;
                }

                // Construir campos comunes
                const module        = session.dayModule.module;
                const moduleStr     = `${ module.code } - ${ module.startHour } - ${ module.endHour }`;
                const SSEC          = `${ session.section.subject.id }-${ session.section.code }`;
                const periodo       = `${ session.section.period.id }-${ session.section.period.name }`;
                const tamanoEspacio = session.section.spaceSize?.id     ?? null;
                const tamanoDetalle = session.section.spaceSize?.detail ?? null;
                const profesorStr   = session.professor ? `${ session.professor.id }-${ session.professor.name }` : null;

                const resultCore = {
                    SSEC,
                    SesionId            : session.id,
                    Numero              : session.section.code,
                    NombreAsignatura    : session.section.subject.name,
                    Fecha               : session.date,
                    Dia                 : session.dayModule.dayId,
                    Modulo              : moduleStr,
                    Periodo             : periodo,
                    TipoPeriodo         : session.section.period.type,
                    Edificio            : session.section.building,
                    TipoEspacio         : session.section.spaceType,
                    TamanoEspacio       : tamanoEspacio,
                    TamanoDetalle       : tamanoDetalle,
                    TipoSesion          : session.name,
                    Cupos               : session.section.quota,
                    Profesor            : profesorStr,
                    Espacio             : null,
                }

                // --- VALIDACIÓN PARA ESPACIOS ---
                if ( type === Type.SPACE ) {
                    const spaceId = data.spaceId;

                    if ( !spaceId ) {
                        results.push({
                            ...resultCore,
                            EspacioActual   : session.spaceId,
                            Estado          : Status.UNAVAILABLE,
                            Detalle         : 'No se especificó un espacio'
                        });

                        continue;
                    }

                    // Buscar el espacio en la lista obtenida del servicio externo
                    const space = allSpaces.find(s => s.name === spaceId);

                    if ( !space ) {
                        results.push({
                            ...resultCore,
                            EspacioActual   : session.spaceId,
                            Estado          : Status.UNAVAILABLE,
                            Detalle         : `Espacio "${spaceId}" no encontrado en el sistema`
                        });

                        continue;
                    }

                    if ( !space.active ) {
                        results.push({
                            ...resultCore,
                            Espacio         : spaceId,
                            EspacioActual   : session.spaceId,
                            Estado          : Status.UNAVAILABLE,
                            Detalle         : `Espacio "${spaceId}" está inactivo`
                        });

                        continue;
                    }

                    // Verificar si el espacio ya está ocupado en esa fecha/módulo
                    const conflictingSession = await this.session.findFirst({
                        where: {
                            date        : session.date,
                            dayModuleId : session.dayModuleId,
                            spaceId     : spaceId,
                            // id          : { not: session.id }
                        }
                    });

                    if ( conflictingSession ) {
                        results.push({
                            ...resultCore,
                            Espacio         : spaceId,
                            EspacioActual   : session.spaceId,
                            Estado          : Status.UNAVAILABLE,
                            Detalle         : `Espacio "${spaceId}" ya está ocupado en esta fecha y horario`
                        });

                        continue;
                    }

                    // Verificar capacidad del espacio vs cupo de la sección
                    const quota = session.section.registered || session.section.quota;

                    if ( space.capacity < quota ) {
                        results.push({
                            ...resultCore,
                            Espacio         : spaceId,
                            EspacioActual   : session.spaceId,
                            Estado          : Status.PROBABLE,
                            Detalle         : `Capacidad del espacio (${space.capacity}) es menor que el cupo de la sección (${quota})`
                        });

                        continue;
                    }

                    let message = 'Espacio disponible para reserva';

                    if ( session.spaceId ) {
                        message = `La sesión ya cuenta con el espacio "${session.spaceId}" asignado, pero se puede reasignar ${spaceId}.`;
                    }

                    // Todo OK
                    results.push({
                        ...resultCore,
                        Espacio         : spaceId,
                        EspacioActual   : session.spaceId,
                        Estado          : Status.AVAILABLE,
                        Detalle         : message
                    });
                }

                // --- VALIDACIÓN PARA PROFESORES ---
                if ( type === Type.PROFESSOR ) {
                    const professorId = data.professor?.id;
                    const professorActual = session.professor ? `${ session.professor.id }-${ session.professor.name }` : null;

                    if ( !professorId ) {
                        results.push({
                            ...resultCore,
                            Profesor        : null,
                            Espacio         : session.spaceId,
                            ProfesorActual  : professorActual,
                            Estado          : Status.UNAVAILABLE,
                            Detalle         : 'No se especificó un profesor'
                        });

                        continue;
                    }

                    const professor = professorMap.get( professorId );

                    if ( !professor ) {
                        results.push({
                            ...resultCore,
                            Profesor        : `${ professorId }-`,
                            ProfesorActual  : professorActual,
                            Espacio         : session.spaceId,
                            Estado          : Status.UNAVAILABLE,
                            Detalle         : `Profesor con ID "${professorId}" no encontrado en la base de datos`
                        });

                        continue;
                    }

                    // Verificar si el profesor ya está ocupado en esa fecha/módulo
                    const conflictingSession = await this.session.findFirst({
                        where: {
                            date        : session.date,
                            dayModuleId : session.dayModuleId,
                            professorId : professorId,
                            id          : { not: session.id }
                        }
                    });

                    if ( conflictingSession ) {
                        results.push({
                            ...resultCore,
                            Profesor        : `${ professor.id }-${ professor.name }`,
                            ProfesorActual  : professorActual,
                            Espacio         : session.spaceId,
                            Estado          : Status.UNAVAILABLE,
                            Detalle         : `Profesor "${professor.name}" ya está ocupado en esta fecha y horario`
                        });

                        continue;
                    }

                    // Todo OK
                    results.push({
                        ...resultCore,
                        Profesor        : `${ professor.id }-${ professor.name }`,
                        ProfesorActual  : professorActual,
                        Espacio         : session.spaceId,
                        Estado          : Status.AVAILABLE,
                        Detalle         : 'Profesor disponible para asignación'
                    });
                }
            }

            return {
                type: type,
                data: results
            };
        } catch (error) {
            throw PrismaException.catch(error, 'Error al calcular disponibilidad de sesiones');
        }
    }

}
