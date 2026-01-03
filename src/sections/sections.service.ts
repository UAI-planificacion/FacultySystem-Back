import { Injectable, BadRequestException, OnModuleInit, NotFoundException }  from '@nestjs/common';

import { $Enums, PrismaClient } from 'generated/prisma';
// import * as xlsx                from 'xlsx';
import { ulid }                 from 'ulid';

// import {
//     PeriodData,
//     ProfessorData,
//     Section,
//     SubjectData,
//     SubjectSection
// }                                   from '@sections/models/data.model';
import { CreateSectionDto }         from '@sections/dto/create-section.dto';
import { UpdateSectionDto }         from '@sections/dto/update-section.dto';
// import { SizeValue }                from '@sections/enums/capacity-size.enum';
// import { SpaceType }                from '@sections/enums/space-type.enum';
// import { Building }                 from '@sections/enums/building.enum';
// import { SizeEnum }                 from '@sections/enums/size.enum';
import { SectionDto }               from '@sections/dto/section.dto';
// import { CreateInitialSectionDto }  from '@sections/dto/initial-section.dto';
// import { UpdateGroupDto }           from '@sections/dto/update-group.dto';
import { PrismaException }          from '@config/prisma-catch';
import { CleanSectionDto }          from '@sections/dto/clean-section.dto';
import { Type }                     from '@sessions/interfaces/excelSession.dto';
import { SpacesService }            from '@commons/services/spaces.service';
import { SELECT_SECTION }           from '@commons/querys/sections-query';
import { SELECT_SESSION }           from '@commons/querys/session-query';


@Injectable()
export class SectionsService extends PrismaClient implements OnModuleInit {

	constructor( private readonly spacesService: SpacesService ) {
		super();
	}


    onModuleInit() {
		this.$connect();
	}


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
        sessions        : {
            ids         : section.sessions.map(( session : any ) => session.id ),
            spaceIds    : section.sessions.map(( session : any ) => session.spaceId ),
            dayIds      : section.sessions.map(( session : any ) => session.dayModule?.dayId ),
            moduleIds   : section.sessions.map(( session : any ) => session.dayModule?.moduleId ),
            professorIds: section.sessions.map(( session : any ) => session.professor?.id ),
        },
        haveRequest: !!section.request?.id
    });


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
        // section             : {
        //     id                  : session.section?.id || null,
        //     code                : session.section?.code || null,
        //     startDate           : session.section?.startDate || null,
        //     endDate             : session.section?.endDate || null,
        //     building            : session.section?.building || null,
        //     subject             : {
        //         id                  : session.section?.subject?.id || null,
        //         name                : session.section?.subject?.name || null,
        //     }
        // },
        module: session.dayModule?.module ? {
            id          : session.dayModule.module.id,
            code        : session.dayModule.module.code,
            name        : `M${session.dayModule.module.code}${session.dayModule.module.difference ? `-${session.dayModule.module.difference} ` : ''} ${session.dayModule.module.startHour}-${session.dayModule.module.endHour}`,
            startHour   : session.dayModule.module.startHour,
            endHour     : session.dayModule.module.endHour,
            difference  : session.dayModule.module.difference,
        } : null,
    });


    #convertToSectionDto2 = ( section: any ): SectionDto => ({
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
        sessions        : section.sessions?.map(( session : any ) => this.convertToSessionDto( session )) ?? [],
        haveRequest: !!section.request?.id
    });


    async createMassiveOfferSections( createSectionDto: CreateSectionDto[] ) {
        try {
            const allSectionsToCreate : any[]       = [];
            const groupIds            : string[]    = [];

            // Get all unique subjectIds from the request
            const uniqueSubjectIds = [...new Set( createSectionDto.map( offer => offer.subjectId ))];

            // Fetch all subjects in a single query
            const subjects = await this.subject.findMany({
                where   : {
                    id : {
                        in : uniqueSubjectIds
                    }
                },
                select  : {
                    id              : true,
                    quota           : true,
                    lecture         : true,
                    workshop        : true,
                    tutoringSession : true,
                    laboratory      : true,
                    spaceSizeId     : true,
                    spaceType       : true,
                }
            });

            const periods = await this.period.findMany({
                where   : {
                    id : {
                        in : createSectionDto.map( offer => offer.periodId )
                    }
                },
                select  : {
                    id          : true,
                    startDate   : true,
                    endDate     : true,
                    openingDate : true,
                    closingDate : true,
                }
            });

            // Create a Map for quick access to subjects by id
            const subjectsMap   = new Map( subjects.map( subject => [subject.id, subject] ));
            const periodsMap    = new Map( periods.map( period => [period.id, period] ));

            // Process each section offer
            for ( const sectionOffer of createSectionDto ) {
                const {
                    numberOfSections,
                    ...sectionBaseData
                } = sectionOffer;

                const period = periodsMap.get( sectionOffer.periodId );

                if ( !period ) {
                    console.log( `Period ${sectionOffer.periodId} not found, skipping section offer` );
                    continue;
                }

                const currentDate = new Date();
                currentDate.setHours( 0, 0, 0, 0 ); // Reset time to start of day for comparison

                // Use openingDate/closingDate if they exist, otherwise use startDate/endDate
                const effectiveOpeningDate = period.openingDate || period.startDate;
                const effectiveClosingDate = period.closingDate || period.endDate;

                // Validate current date is within the allowed range
                if ( currentDate < effectiveOpeningDate ) {
                    console.log( `Current date is before period opening date, skipping section offer` );
                    continue;
                }

                // Don't allow creating sections if current date is past or equal to closing date
                if ( currentDate >= effectiveClosingDate ) {
                    console.log( `Current date is past or equal to period closing date, skipping section offer` );
                    continue;
                }

                // Clean empty string values and convert to undefined
                const cleanedData = Object.entries( sectionBaseData ).reduce(( acc, [key, value] ) => {
                    // Convert empty strings to undefined for optional fields
                    if ( value === '' || value === null ) {
                        acc[key] = undefined;
                    } else {
                        acc[key] = value;
                    }
                    return acc;
                }, {} as any );

                cleanedData.spaceSizeId ??= subjectsMap.get( sectionOffer.subjectId )?.spaceSizeId;
                cleanedData.spaceType   ??= subjectsMap.get( sectionOffer.subjectId )?.spaceType;
                cleanedData.startDate   ??= periodsMap.get( sectionOffer.periodId )?.startDate;
                cleanedData.endDate     ??= periodsMap.get( sectionOffer.periodId )?.endDate;

                if (
                    sectionOffer.lecture            === 0
                    && sectionOffer.workshop        === 0
                    && sectionOffer.tutoringSession === 0
                    && sectionOffer.laboratory      === 0
                ) {
                    const subject = subjectsMap.get( sectionOffer.subjectId );

                    if ( subject ) {
                        cleanedData.lecture         = subject.lecture;
                        cleanedData.workshop        = subject.workshop;
                        cleanedData.tutoringSession = subject.tutoringSession;
                        cleanedData.laboratory      = subject.laboratory;
                    }
                }

                // Generate a single groupId for all sections of this offer
                const groupId = ulid();
                groupIds.push( groupId );

                // Create multiple sections with sequential codes
                const sectionsToCreate = Array.from({ length: numberOfSections }, ( _, index ) => ({
                    code    : index + 1,
                    groupId,
                    ...cleanedData
                }));

                allSectionsToCreate.push( ...sectionsToCreate );
            }

            // Create all sections in bulk
            await this.section.createMany({
                data : allSectionsToCreate
            });

            // Retrieve all created sections
            const sections = await this.section.findMany({
                select  : SELECT_SECTION,
                where   : {
                    groupId : {
                        in : groupIds
                    }
                }
            });

            return sections.map( section => this.#convertToSectionDto( section ));
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create sections' );
        }
    }


    async createOfferSections( createSectionDto: CreateSectionDto ) {
        try {
            const {
                numberOfSections,
                ...sectionBaseData
            } = createSectionDto;

            // Generate a single groupId for all sections
            const groupId = ulid();

            const subject = await this.subject.findUnique({
                where: {
                    id : createSectionDto.subjectId
                },
                select : {
                    spaceSizeId     : true,
                    spaceType       : true,
                    laboratory      : true,
                    workshop        : true,
                    lecture         : true,
                    tutoringSession : true,
                    quota           : true,
                }
            });

            if ( !subject ) {
                throw new NotFoundException('Subject not found');
            }

            const period = await this.period.findUnique({
                where: { id : createSectionDto.periodId},
                select : {
                    startDate   : true,
                    endDate     : true,
                    openingDate : true,
                    closingDate : true,
                }
            });

            if ( !period ) {
                throw new NotFoundException('Period not found');
            }

            const currentDate = new Date();
            currentDate.setHours( 0, 0, 0, 0 ); // Reset time to start of day for comparison

            // Use openingDate/closingDate if they exist, otherwise use startDate/endDate
            const effectiveOpeningDate = period.openingDate || period.startDate;
            const effectiveClosingDate = period.closingDate || period.endDate;

            // Validar que la fecha actual esté dentro del rango permitido
            if ( currentDate < effectiveOpeningDate ) {
                throw new BadRequestException(
                    `No se pueden crear secciones antes de la fecha de apertura del período. ` +
                    `El período abre el ${effectiveOpeningDate.toISOString().split( 'T' )[0]}, ` +
                    `la fecha actual es ${currentDate.toISOString().split( 'T' )[0]}.`
                );
            }

            // No permitir crear secciones si la fecha actual es mayor o igual a la fecha de cierre
            if ( currentDate >= effectiveClosingDate ) {
                throw new BadRequestException(
                    `No se pueden crear secciones en o después de la fecha de cierre del período. ` +
                    `El período cierra el ${effectiveClosingDate.toISOString().split( 'T' )[0]}, ` +
                    `la fecha actual es ${currentDate.toISOString().split( 'T' )[0]}. ` +
                    `Las secciones deben crearse antes de la fecha de cierre.`
                );
            }

            let lecture         = createSectionDto.lecture;
            let workshop        = createSectionDto.workshop;
            let tutoringSession = createSectionDto.tutoringSession;
            let laboratory      = createSectionDto.laboratory;

            if (
                createSectionDto.lecture            === 0
                && createSectionDto.workshop        === 0
                && createSectionDto.tutoringSession === 0
                && createSectionDto.laboratory      === 0
            ) {
                lecture         = subject.lecture;
                workshop        = subject.workshop;
                tutoringSession = subject.tutoringSession;
                laboratory      = subject.laboratory;
            }

            const sectionsToCreate = Array.from({ length: numberOfSections }, ( _, index ) => ({
                code: index + 1,
                groupId,
                ...sectionBaseData,
                startDate   : createSectionDto.startDate    || period.startDate,
                endDate     : createSectionDto.endDate      || period.endDate,
                quota       : createSectionDto.quota        || subject.quota || 0,
                lecture,
                workshop,
                tutoringSession,
                laboratory,
            }));

            // Create all sections
            await this.section.createMany({
                data: sectionsToCreate
            });

            const sections = await this.section.findMany({
                select  : SELECT_SECTION,
                where   : {
                    groupId
                }
            });

            return sections.map( section => this.#convertToSectionDto( section ));
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create sections' );
        }
    }


    async findAll() {
        const currentYear = new Date().getFullYear();

        // Inicio del año actual (1 de enero)
        const startOfYear = new Date(currentYear, 0, 1);
        // Fin del año actual (31 de diciembre)
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
        const sections = await this.section.findMany({
            select: SELECT_SECTION,
            where : {
                // period: {
                //     createdAt : {
                //         gte: new Date( new Date().getFullYear(), 0, 1 ),
                //     }
                // }
                period: {
                    // Filtramos por las fechas de vigencia, no por createdAt
                    AND: [
                        {
                            endDate: {
                                gte: startOfYear, // Debe terminar después de que empezó el año
                            },
                        },
                        {
                            startDate: {
                                lte: endOfYear, // Debe empezar antes de que termine el año
                            }
                        }
                    ]
                }
            }
        });

        return sections.map( section => this.#convertToSectionDto( section ));
    }


    async findAllAndSessions() {
        const currentYear = new Date().getFullYear();

        // Inicio del año actual (1 de enero)
        const startOfYear = new Date(currentYear, 0, 1);
        // Fin del año actual (31 de diciembre)
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
        //TODO: Agregar con SELECT_SESSION quitando section de session
        const query = {
            ...SELECT_SECTION,
            sessions : {
                select :  {
                    id              : true,
                    name            : true,
                    spaceId         : true,
                    isEnglish       : true,
                    chairsAvailable : true,
                    date            : true,
                    dayModule       : {
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
                }
            }
        };

        const sections = await this.section.findMany({
            select: query,
            where : {
                // period: {
                //     createdAt : {
                //         gte: new Date( new Date().getFullYear(), 0, 1 ),
                //     }
                // }
                period: {
                    // Filtramos por las fechas de vigencia, no por createdAt
                    AND: [
                        {
                            endDate: {
                                gte: startOfYear, // Debe terminar después de que empezó el año
                            },
                        },
                        {
                            startDate: {
                                lte: endOfYear, // Debe empezar antes de que termine el año
                            }
                        }
                    ]
                }
            }
        });

        return sections.map( section => this.#convertToSectionDto2( section ));
    }


    async findAllByFacultyId( facultyId: string ) {
        const currentYear = new Date().getFullYear();

        // Inicio del año actual (1 de enero)
        const startOfYear = new Date(currentYear, 0, 1);
        // Fin del año actual (31 de diciembre)
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
        const sections = await this.section.findMany({
            select: SELECT_SECTION,
            where : {
                // period: {
                //     createdAt : {
                //         gte: new Date( new Date().getFullYear(), 0, 1 ),
                //     }
                // },
                period: {
                    // Filtramos por las fechas de vigencia, no por createdAt
                    AND: [
                        {
                            endDate: {
                                gte: startOfYear, // Debe terminar después de que empezó el año
                            },
                        },
                        {
                            startDate: {
                                lte: endOfYear, // Debe empezar antes de que termine el año
                            }
                        }
                    ]
                },
                subject: {
                    facultyId
                }
            }
        });

        return sections.map( section => this.#convertToSectionDto( section ));
    }


    async findOne( id: string ) {
        const section = await this.section.findUnique({
            where   : { id },
            select  : SELECT_SECTION
        });

        if ( !section ) {
            throw new NotFoundException( 'Section not found.' );
        }

        return this.#convertToSectionDto( section );
    }


    async changeStatusSection( sectionId: string ) {
        try {
            let sectiondata = await this.findOne( sectionId );

            const isClosed = !sectiondata.isClosed;

            await this.section.update({
                where   : { id: sectionId },
                data    : { isClosed },
            });

            sectiondata = {
                ...sectiondata,
                isClosed
            }

            return sectiondata;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update section' );
        }
    }


    async changeMassiveStatusSection( sectionIds: string[] ) {
        try {
            // Buscar todas las secciones por sus IDs
            const sections = await this.section.findMany({
                where   : {
                    id : {
                        in : sectionIds
                    }
                },
                select  : SELECT_SECTION
            });

            if ( !sections || sections.length === 0 ) {
                throw new NotFoundException( 'Sections not found.' );
            }

            // Cambiar el estado de cada sección (de true a false o false a true)
            const sectionsToUpdate = sections.map( section => ({
                id          : section.id,
                isClosed    : !section.isClosed
            }));

            // Actualizar todas las secciones en una sola operación masiva
            await Promise.all(
                sectionsToUpdate.map( section =>
                    this.section.update({
                        where   : { id: section.id },
                        data    : { isClosed: section.isClosed }
                    })
                )
            );

            // Retornar las secciones actualizadas
            const updatedSections = await this.section.findMany({
                where   : {
                    id : {
                        in : sectionIds
                    }
                },
                select  : SELECT_SECTION
            });

            return updatedSections.map( section => this.#convertToSectionDto( section ));
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update sections' );
        }
    }


    async findSectionNotPlanning() {
        return await this.section.findMany({
            where: {
                sessions: {
                    none: {}
                },
                request: {
                    is: null
                }
            },
            select: SELECT_SECTION
        });
    }


    async findSectionPlanning() {
        return await this.section.findMany({
            where: {
                sessions: {
                    some: {}
                }
            },
            select: SELECT_SECTION
        });
    }


    async update( id: string, updateSectionDto: UpdateSectionDto ) {
        try {
            const sectionUpdated = await this.section.update({
                select  : SELECT_SECTION,
                where   : { id },
                data    : updateSectionDto
            });

            if ( !sectionUpdated ) throw new BadRequestException( 'Error updating section' );

            // Si se actualizó quota o registered, recalcular chairsAvailable de las sesiones
            if ( updateSectionDto.quota !== undefined || updateSectionDto.registered !== undefined ) {
                await this.#updateSessionsChairsAvailable( id, sectionUpdated.quota, sectionUpdated.registered );
            }

            return this.#convertToSectionDto( sectionUpdated );
        } catch ( error ) {
            console.error( 'Error updating section:', error );
            throw PrismaException.catch( error, 'Failed to update section' );
        }
    }


    async clean( type: Type, cleanSectionDto: CleanSectionDto ) {
        if ( type === Type.REGISTERED ) {
            throw new BadRequestException( 'Type not allowed' );
        }

        const sections = await this.section.findMany({
            select  : SELECT_SECTION,
            where   : {
                id: {
                    in: cleanSectionDto.ids,
                },
            }
        });

        if ( !sections || sections.length === 0 ) {
            throw new BadRequestException( 'Sections not found' );
        }

        await this.session.updateMany({
            data: {
                ...( type === Type.SPACE        ? {
                    spaceId: null,
                    chairsAvailable: null
                }     : {} ),
                ...( type === Type.PROFESSOR    ? { professorId: null } : {} ),
            },
            where: {
                sectionId: {
                    in: sections.map( s => s.id ),
                },
            },
        });

        return sections.map( section => this.#convertToSectionDto( section ));
    }


    async remove( id: string ) {
        try {
            const section = await this.section.delete({
                where: { id },
            });

            return section;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete section' );
        }
    }


	/**
	 * Updates chairsAvailable for all sessions of a section based on space capacity and quota/registered
	 * @param sectionId - The ID of the section
	 * @param quota - The quota value from the section
	 * @param registered - The registered value from the section (optional, takes priority over quota)
	 */
	async #updateSessionsChairsAvailable( sectionId: string, quota: number, registered?: number | null ) {
		try {
			// 1. Obtener todas las sesiones de esta sección que tengan un spaceId asignado
			const sessions = await this.session.findMany({
				where: {
					sectionId,
					spaceId: {
						not: null
					}
				},
				select: {
					id      : true,
					spaceId : true,
				}
			});

			// Si no hay sesiones con espacios asignados, no hay nada que actualizar
			if ( sessions.length === 0 ) {
				return;
			}

			// 2. Obtener todos los espacios del servicio externo
			const allSpaces = await this.spacesService.getSpaces();

			// 3. Crear un mapa de espacios por ID para acceso rápido
			const spacesMap = new Map( allSpaces.map( space => [space.id.toString(), space] ));

			// 4. Determinar el valor a usar: registered tiene prioridad sobre quota
			const capacityToUse = ( registered !== null && registered !== undefined && registered > 0 ) ? registered : quota;

			// 5. Preparar las actualizaciones para cada sesión
			const updatePromises = sessions.map( async ( session ) => {
				const space = spacesMap.get( session.spaceId! );

				if ( !space ) {
					console.warn( `Space ${session.spaceId} not found for session ${session.id}` );
					return;
				}

				// Calcular chairsAvailable = capacidad del espacio - (registered o quota)
				const chairsAvailable = space.capacity - capacityToUse;

				// Actualizar la sesión
				return this.session.update({
					where   : { id: session.id },
					data    : { chairsAvailable }
				});
			});

			// 6. Ejecutar todas las actualizaciones en paralelo
			await Promise.all( updatePromises );
		} catch ( error ) {
			console.error( 'Error updating sessions chairsAvailable:', error );
			throw new BadRequestException( 'Failed to update sessions chairsAvailable' );
		}
	}

}
