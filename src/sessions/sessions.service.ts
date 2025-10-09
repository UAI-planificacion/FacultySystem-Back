import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { $Enums, PrismaClient } from 'generated/prisma';

import { PrismaException }          from '@config/prisma-catch';
import { CreateSessionDto }         from '@sessions/dto/create-session.dto';
import { UpdateSessionDto }         from '@sessions/dto/update-session.dto';
import { CreateMassiveSessionDto }  from '@sessions/dto/create-massive-session.dto';
import { SectionsService }          from '@sections/sections.service';
import { MassiveUpdateSessionDto }  from '@sessions/dto/massive-update-session.dto';


@Injectable()
export class SessionsService extends PrismaClient implements OnModuleInit {

    constructor(
        private readonly sectionsService: SectionsService
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
        dayId                   : session.dayModule.dayId,
        dayModuleId             : session.dayModule.id,
        date                    : session.date,
        module                  : {
            id          : session.dayModule.module.id,
            code        : session.dayModule.module.code,
            name        : `M${session.dayModule.module.code}${session.dayModule.module.difference ? `-${session.dayModule.module.difference} ` : ''} ${session.dayModule.module.startHour}-${session.dayModule.module.endHour}`,
            startHour   : session.dayModule.module.startHour,
            endHour     : session.dayModule.module.endHour,
            difference  : session.dayModule.module.difference,
        }
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


    async createMassive( sectionId: string, createMassiveSessionsDto: CreateMassiveSessionDto[] ) {
        try {
            // 1. Obtener la información de la sección con sus fechas
            const section = await this.section.findUnique({
                where   : { id: sectionId },
                select  : {
                    id          : true,
                    startDate   : true,
                    endDate     : true,
                    professorId : true,
                }
            });

            if ( !section ) {
                throw new Error( `Section with id ${sectionId} not found` );
            }

            const { startDate, endDate } = section;
            const sessionsToCreate: Array<{
                name        : $Enums.SessionName;
                sectionId   : string;
                dayModuleId : number;
                spaceId     : string;
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
                    throw new Error( `Some dayModuleIds are invalid: ${dayModuleIds.join( ', ' )}` );
                }

                // 4. Calcular todas las fechas posibles para cada dayModule
                for ( const dayModule of dayModules ) {
                    const dayOfWeek = dayModule.day.id; // 1 = Lunes, 7 = Domingo
                    const startHour = dayModule.module.startHour;
                    const endHour   = dayModule.module.endHour;

                    // Calcular todas las fechas que coinciden con este día de la semana
                    const dates = this.calculateDatesForDayOfWeek( startDate, endDate, dayOfWeek );

                    // 5. Crear una sesión para cada fecha calculada
                    for ( const date of dates ) {
                        // Combinar fecha con hora de inicio del módulo
                        const sessionDate = this.combineDateAndTime( date, startHour );

                        sessionsToCreate.push({
                            name        : session,
                            sectionId   : sectionId,
                            dayModuleId : dayModule.id,
                            spaceId     : spaceId,
                            professorId : professorId   || section.professorId,
                            isEnglish   : isEnglish     || false,
                            date        : sessionDate,
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
            return this.sectionsService.findOne( sectionId );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create sessions' );
        }
    }

	/**
	 * Find all available dates for a session based on dayModuleId and spaceId
	 * @param sectionId - ID of the session to get the section date range
	 * @param dayModuleId - ID of the day module (day + time range)
	 * @param spaceId - ID of the space to check availability
	 * @returns Array of available dates or empty array if none available
	 */
	async findAvailableSessions( sectionId: string, dayModuleId: string, spaceId: string ): Promise<Date[]> {
		try {
			// 1. Obtener la sesión con su sección relacionada
			const section = await this.section.findUnique({
				where   : { id: sectionId },
				select  : {
					startDate   : true,
					endDate     : true,
				}
			});
			// const session = await this.session.findUnique({
			// 	where   : { id: sessionId },
			// 	select  : {
			// 		// id      : true,
			// 		section : {
			// 			select: {
			// 				id          : true,
			// 				startDate   : true,
			// 				endDate     : true,
			// 			}
			// 		}
			// 	}
			// });

			if ( !section ) {
                throw new NotFoundException( `Section with id ${sectionId} not found` );
			}
			// if ( !session || !session.section ) {
			// 	return [];
			// }

			const { startDate, endDate } = section;
			// const { startDate, endDate } = session.section;

			// 2. Obtener información del dayModule
			const dayModule = await this.dayModule.findUnique({
				where   : { id: Number( dayModuleId ) },
				include : {
					day     : true,
					module  : true,
				}
			});

			if ( !dayModule ) {
                throw new NotFoundException( `DayModule with id ${dayModuleId} not found` );
			}

			const dayOfWeek = dayModule.day.id;
			const startHour = dayModule.module.startHour;

			// 3. Calcular todas las fechas posibles para este día de la semana
			const possibleDates = this.calculateDatesForDayOfWeek( startDate, endDate, dayOfWeek );

			// 4. Filtrar las fechas que están disponibles (sin conflictos)
			const availableDates: Date[] = [];

			for ( const date of possibleDates ) {
				// Combinar fecha con hora de inicio del módulo
				const sessionDate = this.combineDateAndTime( date, startHour );

				// Verificar si existe una sesión en esta fecha y espacio
				const existingSession = await this.session.findFirst({
					where: {
						date    : sessionDate,
						spaceId : spaceId,
					}
				});

				// Si no existe sesión, la fecha está disponible
				if ( !existingSession ) {
					availableDates.push( sessionDate );
				}
			}

			// 5. Retornar las fechas disponibles
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
            dates.push( new Date( currentDate ) );
            currentDate.setDate( currentDate.getDate() + 7 ); // Siguiente semana
        }

        return dates;
    }


    /**
     * Combine a date with a time string (HH:mm format)
     * @param date - Date to combine
     * @param timeString - Time string in HH:mm format
     * @returns Combined DateTime
     */
    private combineDateAndTime( date: Date, timeString: string ): Date {
        const [hours, minutes] = timeString.split( ':' ).map( Number );
        const combined = new Date( date );
        combined.setHours( hours, minutes, 0, 0 );
        return combined;
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

            // Buscar sesiones existentes con la misma fecha y espacio
            const existingSessions = await this.session.findMany({
                where: {
                    date    : session.date,
                    spaceId : session.spaceId,
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

            const key = `${session.date.toISOString()}_${session.spaceId}`;
            
            if ( sessionMap.has( key ) ) {
                const conflicting = sessionMap.get( key );
                throw new Error(
                    `Conflict detected in request: Multiple sessions (${conflicting.name} and ${session.name}) ` +
                    `are scheduled for the same date ${session.date.toISOString().split( 'T' )[0]} ` +
                    `and space ${session.spaceId}.`
                );
            }

            sessionMap.set( key, session );
        }
    }


    findAll() {
        try {
            return this.session.findMany();
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to find all sessions' );
        }
    }


    async findOne( id: string ) {
        try {
            const session = await this.session.findUnique({
                where: { id },
                select: this.#selectSession,
            });

            return this.#convertToSessionDto( session );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to find session' );
        }
    }


    async update( id: string, updateSessionDto: UpdateSessionDto ) {
        try {
            const session = await this.session.update({
                where: { id },
                data: updateSessionDto,
                select: this.#selectSession,
            });

            return this.#convertToSessionDto( session );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update session' );
        }
    }


    async massiveUpdate( updateSectionDto: MassiveUpdateSessionDto ) {
        try {
            const { ids, ...data }  = updateSectionDto;

            if ( Object.keys( data ).length === 0 ) {
                throw new BadRequestException( 'No data to update' );
            }

            const sessionsUpdated   = await this.session.updateManyAndReturn({
                select  : { id: true },
                where   : { id: { in: ids }},
                data
            });

            if ( !sessionsUpdated ) {
                throw new BadRequestException( 'Error updating sessions' );
            }

            const sessionsData = await this.session.findMany({
                select  : this.#selectSession,
                where   : {
                    id: {
                        in: sessionsUpdated.map( session => session.id )
                    }
                }
            })

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
