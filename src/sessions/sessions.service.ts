import {
    BadRequestException,
    Injectable,
    NotFoundException,
    OnModuleInit
} from '@nestjs/common';

import { $Enums, PrismaClient } from 'generated/prisma';

import {
    SessionAvailabilityResponse,
    AvailableSpace,
    AvailableProfessor,
    ScheduledDate
}                                   from '@sessions/interfaces/session-availability.interface';
import { SpacesService }            from '@commons/services/spaces.service';
import { PrismaException }          from '@config/prisma-catch';
import { CreateSessionDto }         from '@sessions/dto/create-session.dto';
import { UpdateSessionDto }         from '@sessions/dto/update-session.dto';
import { CreateMassiveSessionDto }  from '@sessions/dto/create-massive-session.dto';
import { MassiveUpdateSessionDto }  from '@sessions/dto/massive-update-session.dto';
import { CalculateAvailabilityDto } from '@sessions/dto/calculate-availability.dto';
import { AvailableSessionDto }      from '@sessions/dto/available-session.dto';
import { SectionsService }          from '@sections/sections.service';


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


    #selectSession = {
        id                      : true,
        name                    : true,
        spaceId                 : true,
        isEnglish               : true,
        chairsAvailable         : true,
        correctedRegistrants    : true,
        realRegistrants         : true,
        plannedBuilding         : true,
        date                    : true,
        dayModule               : {
            select: {
                id      : true,
                dayId   : true,
                module  : {
                    select: {
                        id          : true,
                        code        : true,
                        startHour   : true,
                        endHour     : true,
                        difference  : true,
                    }
                }
            }
        },
        professor: {
            select: {
                id      : true,
                name    : true,
            }
        },
        planningChange : {
            select :{
                id: true
            }
        },
        section : {
            select : {
                id : true,
                code : true,
                startDate : true,
                endDate: true,
                subject: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        }
    }


    #convertToSessionDto = ( session: any ) => ({
        id                      : session.id,
        name                    : session.name,
        spaceId                 : session.spaceId,
        isEnglish               : session.isEnglish,
        chairsAvailable         : session.chairsAvailable,
        correctedRegistrants    : session.correctedRegistrants,
        realRegistrants         : session.realRegistrants,
        plannedBuilding         : session.plannedBuilding,
        professor               : session.professor,
        dayId                   : session.dayModule?.dayId || null,
        dayModuleId             : session.dayModule?.id || null,
        date                    : session.date,
        planningChangeId        : session.planningChange?.id || null,
        section                 : {
            id          : session.section?.id || null,
            code        : session.section?.code || null,
            startDate   : session.section?.startDate || null,
            endDate     : session.section?.endDate || null,
            subject     : {
                id          : session.section?.subject?.id || null,
                name        : session.section?.subject?.name || null,
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


    async create( createSessionDto: CreateSessionDto ) {
        try {
            const session = await this.session.create({
                data: createSessionDto,
                select: this.#selectSession,
            });

            return this.#convertToSessionDto( session );
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
                    period: {
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

            const startDate = section.period.openingDate || section.period.startDate;
            const endDate   = section.period.closingDate || section.period.endDate;

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
                name        : $Enums.SessionName;
                sectionId   : string;
                dayModuleId : number;
                spaceId     : string | null;
                professorId : string | null;
                isEnglish   : boolean;
                date        : Date;
            }> = [];

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
                        sessionsToCreate.push({
                            name        : session,
                            sectionId   : sectionId,
                            dayModuleId : dayModule.id,
                            spaceId     : spaceId       || null,
                            professorId : professorId   || null,
                            isEnglish   : isEnglish     || false,
                            date,
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
            console.log('🚀 ~ file: sessions.service.ts:517 ~ error:', error)
            throw PrismaException.catch( error, 'Failed to create sessions' );
        }
    }

	/**
	 * Find all available dates for a session based on dayModuleId, spaceId and professorId
	 * @param availableSessionDto - Object containing sessionId, dayModuleId, spaceId and professorId
	 * @returns Array of available dates or empty array if none available
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

			// 4. Find all sessions with space conflicts (1 query)
			const spaceConflicts = await this.session.findMany({
				where: {
					spaceId	: spaceId,
					date	: { in: possibleDates }
				},
				select: { date: true }
			});

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
            select: this.#selectSession,
            // where : {
            //     createdAt: {
            //         gte: new Date( new Date().setDate( new Date().getDate() - 7 ) ),
            //     }
            // }
        });

        if ( sessions?.length === 0 ) return [];

        return sessions.map( this.#convertToSessionDto );
    }


    async findOne( id: string ) {
        const session = await this.session.findUnique({
            where   : { id },
            select  : this.#selectSession,
        });

        if ( !session ) {
            throw new NotFoundException( `Session with id ${id} not found` );
        }

        return this.#convertToSessionDto( session );
    }


    async findBySectionId( sectionId : string ) {
        const session = await this.session.findMany({
            where: { sectionId },
            select: this.#selectSession,
        });

        if ( session.length === 0 ) return [];

        return session.map( this.#convertToSessionDto );
    }


    async update( id: string, updateSessionDto: UpdateSessionDto ) {
        try {
            const session = await this.session.update({
                where   : { id },
                data    : updateSessionDto,
                select  : this.#selectSession,
            });

            return this.#convertToSessionDto( session );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update session' );
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
					select	: { id: true, date: true, dayModuleId: true, professorId: true, spaceId: true }
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
					await this.session.updateMany({
						where	: { id: { in: sessionIdsToUpdate }},
						data	: { spaceId }
					});
				}
			}

			// 4. Return all updated sessions
			const sessionsData = await this.session.findMany({
				select	: this.#selectSession,
				where	: { id: { in: ids }}
			});

			return sessionsData.map( session => this.#convertToSessionDto( session ));
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
				where: { id: { in: ids } }
			});
		} catch ( error ) {
			throw PrismaException.catch( error, 'Failed to delete sessions' );
		}
	}

}
