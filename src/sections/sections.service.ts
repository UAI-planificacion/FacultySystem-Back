import { Injectable, BadRequestException, OnModuleInit, NotFoundException }  from '@nestjs/common';

import { $Enums, PrismaClient } from 'generated/prisma';
import * as xlsx                from 'xlsx';
import { ulid }                 from 'ulid';

import {
    PeriodData,
    ProfessorData,
    Section,
    SubjectData,
    SubjectSection
}                                   from '@sections/models/data.model';
import { CreateSectionDto }         from '@sections/dto/create-section.dto';
import { UpdateSectionDto }         from '@sections/dto/update-section.dto';
import { SizeValue }                from '@sections/enums/capacity-size.enum';
import { SpaceType }                from '@sections/enums/space-type.enum';
import { Building }                 from '@sections/enums/building.enum';
import { SizeEnum }                 from '@sections/enums/size.enum';
import { SectionDto }               from '@sections/dto/section.dto';
import { CreateInitialSectionDto }  from '@sections/dto/initial-section.dto';
import { UpdateGroupDto }           from '@sections/dto/update-group.dto';
import { PrismaException }          from '@config/prisma-catch';


@Injectable()
export class SectionsService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
		this.$connect();
	}


    #selectSection = {
        id              : true,
        code            : true,
        isClosed        : true,
        groupId         : true,
        startDate       : true,
        endDate         : true,
        spaceSizeId     : true,
        spaceType       : true,
        workshop        : true,
        lecture         : true,
        tutoringSession : true,
        laboratory      : true,
        building        : true,
        professor: {
            select : {
                id      : true,
                name    : true,
            }
        },
        subject: {
            select: {
                id      : true,
                name    : true,
            }
        },
        period      : {
            select: {
                id          : true,
                name        : true,
                startDate   : true,
                endDate     : true,
                openingDate : true,
                closingDate : true,
            }
        },
        sessions: {
            select: {
                id          : true,
                spaceId     : true,
                dayModule   : {
                    select      : {
                        dayId       : true,
                        moduleId    : true,
                    }
                },
                professor: {
                    select: {
                        id      : true,
                        name    : true,
                    }
                },
            }
        },
        request : {
            select: {
                id: true,
            }
        },
        _count: {
            select: {
                sessions: true
            }
        },
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
            ids             : section.sessions.map(( session : any ) => session.id),
            spaceIds        : section.sessions.map(( session : any ) => session.spaceId),
            dayIds          : section.sessions.map(( session : any ) => session.dayModule.dayId),
            moduleIds       : section.sessions.map(( session : any ) => session.dayModule.moduleId),
            professorIds    : section.sessions.map(( session : any ) => session.professor.id),
        },
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
                    console.warn( `Period ${sectionOffer.periodId} not found, skipping section offer` );
                    continue;
                }

                const currentDate = new Date();
                currentDate.setHours( 0, 0, 0, 0 ); // Reset time to start of day for comparison

                // Use openingDate/closingDate if they exist, otherwise use startDate/endDate
                const effectiveOpeningDate = period.openingDate || period.startDate;
                const effectiveClosingDate = period.closingDate || period.endDate;

                // Validate current date is within the allowed range
                if ( currentDate < effectiveOpeningDate ) {
                    console.warn( `Current date is before period opening date, skipping section offer` );
                    continue;
                }

                // Don't allow creating sections if current date is past or equal to closing date
                if ( currentDate >= effectiveClosingDate ) {
                    console.warn( `Current date is past or equal to period closing date, skipping section offer` );
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
                select  : this.#selectSection,
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
                select  : this.#selectSection,
                where   : {
                    groupId
                }
            });

            return sections.map( section => this.#convertToSectionDto( section ));
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create sections' );
        }
    }


    // async #getSectionData(): Promise<SectionDto[]> {
    //     const sections = await this.section.findMany({
    //         select: this.#selectSection
    //     });

    //     if ( sections.length === 0 ) return [];

    //     return sections.map( section => this.#convertToSectionDto( section ));
    // }


    async findAll() {
        const sections = await this.section.findMany({
            select: this.#selectSection,
            where : {
                period: {
                    createdAt : {
                        gte: new Date( new Date().getFullYear(), 0, 1 ),
                    }
                }
            }
        });

        return sections.map( section => this.#convertToSectionDto( section ));
    }


    // async findAllBySubjectId( subjectId: string ) {
    //     const sections = await this.section.findMany({
    //         where: {
    //             subjectSections: {
    //                 every: {
    //                     subjectId
    //                 }
    //             }
    //         },
    //         select: this.#selectSection
    //     });

    //     return sections.map( section => this.#convertToSectionDto( section ));
    // }


    async findOne( id: string ) {
        const section = await this.section.findUnique({
            where   : { id },
            select  : this.#selectSection
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
            select: this.#selectSection
        });
    }


    async findSectionPlanning() {
        return await this.section.findMany({
            where: {
                sessions: {
                    some: {}
                }
            },
            select: this.#selectSection
        });
    }


    async update( id: string, updateSectionDto: UpdateSectionDto ) {
        try {
            const sectionUpdated = await this.section.update({
                select  : this.#selectSection,
                where   : { id },
                data    : updateSectionDto
            });

            if ( !sectionUpdated ) throw new BadRequestException( 'Error updating section' );

            return this.#convertToSectionDto( sectionUpdated );
        } catch ( error ) {
            console.error( 'Error updating section:', error );
            throw PrismaException.catch( error, 'Failed to update section' );
        }
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
     * Process an Excel file containing section data
     * @param file The uploaded Excel file
     * @returns Array of processed section data
     */
    // async processExcelFile( file: Express.Multer.File ) {
    //     if ( !file ) {
    //         throw new BadRequestException( 'No file uploaded' );
    //     }

    //     const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || '';

    //     if ( !['xlsx', 'xls'].includes( fileExtension )) {
    //         throw new BadRequestException( 'Invalid file format. Only Excel files (.xlsx, .xls) are allowed.' );
    //     }

    //     try {
    //         const workbook = xlsx.read( file.buffer, {
    //             type        : 'buffer',
    //             cellDates   : false,
    //             cellNF      : false,
    //             cellStyles  : false
    //         });

    //         if ( !workbook.SheetNames || workbook.SheetNames.length === 0 ) {
    //             throw new BadRequestException( 'Excel file has no sheets' );
    //         }

    //         const sheetName = workbook.SheetNames[0];
    //         const worksheet = workbook.Sheets[sheetName];

    //         if ( !worksheet ) {
    //             throw new BadRequestException( 'Could not read worksheet' );
    //         }

    //         const rawData       = xlsx.utils.sheet_to_json<ExcelSectionRow>( worksheet );
    //         const processedData = await this.#processRawData( rawData );

    //         return processedData;
    //     } catch ( error ) {
    //         console.error( 'Error processing Excel file:', error );
    //         throw new BadRequestException( `Error processing Excel file: ${error.message}` );
    //     }
    // }


    #getCapacity( capacity: number, sizes: {
        id          : $Enums.SizeValue;
        min         : number | null;
        max         : number | null;
        lessThan    : number | null;
        greaterThan : number | null;
    }[] ): $Enums.SizeValue {
        for ( const size of sizes ) {
            if ( size.min && capacity < size.min ) return size.id;
            if ( size.max && capacity > size.max ) return size.id;
            if ( size.lessThan && capacity < size.lessThan ) return size.id;
            if ( size.greaterThan && capacity > size.greaterThan ) return size.id;
        }

        return SizeValue.XL;
    }


    #getSize( size: string, capacity: number ): $Enums.SizeValue {
        return {
            [SizeEnum.CORE]         : SizeValue.XS  as $Enums.SizeValue,
            [SizeEnum.GARAGE]       : SizeValue.S   as $Enums.SizeValue,
            [SizeEnum.DIS]          : SizeValue.XL  as $Enums.SizeValue,
            [SizeEnum.AUDITORIO]    : SizeValue.XL  as $Enums.SizeValue,
            [SizeEnum.LABPAC]       : SizeValue.XL  as $Enums.SizeValue,
            [SizeEnum.LABPCB]       : SizeValue.L   as $Enums.SizeValue,
            [SizeEnum.LABPCC]       : capacity === 60 ? SizeValue.L : SizeValue.S as $Enums.SizeValue,
            [SizeEnum.LABPCE]       : SizeValue.MS  as $Enums.SizeValue,
            [SizeEnum.LABRED]       : SizeValue.M   as $Enums.SizeValue,
            [SizeEnum.M]            : SizeValue.M   as $Enums.SizeValue,
            [SizeEnum.MS]           : SizeValue.MS  as $Enums.SizeValue,
            [SizeEnum.L]            : SizeValue.L   as $Enums.SizeValue,
            [SizeEnum.SE]           : SizeValue.S   as $Enums.SizeValue,
            [SizeEnum.S]            : SizeValue.S   as $Enums.SizeValue,
            [SizeEnum.XS]           : SizeValue.XS  as $Enums.SizeValue,
        }[size] || SizeValue.L;
    }

    #getSpaceType( name: string, size: string ): $Enums.SpaceType {
        // Comunication
        const communications = [
            '223-D',
            'LAB.110-D'
        ];

        if (
            communications.includes( name ) ||
            size === 'LAB.RED'
        ) return SpaceType.COMMUNIC as $Enums.SpaceType;

        // DIS
        if ( name === 'LAB.103-D' || size === SpaceType.DIS ) return SpaceType.DIS as $Enums.SpaceType;

        // Laboratorio
        const space = [
            'Lab. Bioingeniería',
            'Lab. Ingenieria y Ciencias',
            'Lab. Física',
            'Lab. Informática',
            'Lab. Procesos Industriales'
        ];

        if ( space.includes( name )) return SpaceType.LAB as $Enums.SpaceType;
        // Laboratorio PC
        else if ( name.toUpperCase().includes( 'LAB' )) return SpaceType.LABPC as $Enums.SpaceType;

        // Auditorio
        if ( size === SpaceType.AUDITORIO ) return SpaceType.AUDITORIO as $Enums.SpaceType;

        // Garage
        if ( size === SpaceType.GARAGE ) return SpaceType.GARAGE as $Enums.SpaceType;

        // Core
        if ( size === SpaceType.CORE ) return SpaceType.CORE as $Enums.SpaceType;

        return SpaceType.ROOM as $Enums.SpaceType;
    }


    #getBuilding( name: string ): Building {
        const space = [
            'GARAGE EXTRAPROG.',
            'Lab. Bioingeniería',
            'Lab. Ingenieria y Ciencias',
            'Lab. Física',
            'Lab. Informática',
            'Lab. Procesos Industriales'
        ];

        const buildingList = [
            Building.B,
            Building.F,
            Building.F,
            Building.F,
            Building.F,
            Building.E
        ];

        if ( space.includes( name )) return buildingList[ space.indexOf( name )];

        return ( name.split( '-' )[1]?.[0]?.toUpperCase() as Building ) || Building.Z;
    }


    async #getNewEntitiesToCreate<
        TInputEntity extends Record<string, any>,
        TDbModel extends {
            findMany    : ( args: any ) => Promise<any[]>;
            createMany  : ( args: any ) => Promise<any>;
        },
        TUniqueKey extends keyof TInputEntity
    >(
        entities    : TInputEntity[],
        uniqueKey   : TUniqueKey,
        prismaModel : TDbModel,
        dbSearchKey : string,
        mapper: ( entity: TInputEntity ) => any
    ): Promise<any> {
        const uniqueKeysInExcel     = entities.map( e => e[ uniqueKey ]) as Array<string | number | boolean>;
        const existingDbEntities    = await prismaModel.findMany({
            where: {
                [dbSearchKey]: {
                    in: uniqueKeysInExcel,
                },
            },
            select: {
                [dbSearchKey]: true,
            },
        });

        const existingDbKeys = new Set( existingDbEntities.map( e => e[ dbSearchKey ]));

        return entities
            .filter( entity => !existingDbKeys.has( entity[ uniqueKey ]))
            .map( mapper );
    }

    /**
     * Process raw data from Excel file
     * @param rawData Raw data from Excel file
     * @returns Processed section data
     */
    // async #processRawData( rawData: ExcelSectionRow[] ) {
    //     if ( !rawData || rawData.length === 0 ) {
    //         throw new BadRequestException( 'Excel file is empty or has no valid data' );
    //     }

    //     const dayModules = await this.dayModule.findMany({});

    //     if ( !dayModules || dayModules.length === 0 ) {
    //         throw new BadRequestException( 'No day modules found' );
    //     }

    //     // const uniqueRoomsMap       = new Map<string, RoomData>();
    //     const uniqueProfessorsMap  = new Map<string, ProfessorData>();
    //     const uniqueSubjectsMap    = new Map<string, SubjectData>();
    //     const uniquePeriodsMap     = new Map<string, PeriodData>();

    //     const sectionList   : Section[] = [];
    //     const ssecList      : SubjectSection[] = [];

    //     const sizes = await this.size.findMany({
    //         select: {
    //             id          : true,
    //             min         : true,
    //             max         : true,
    //             lessThan    : true,
    //             greaterThan : true,
    //         }
    //     });

    //     for ( const row of rawData ) {
    //         // Rooms
    //         // const roomName = row.Sala?.trim();
    //         // if ( roomName && !uniqueRoomsMap.has( roomName )) {
    //         //     uniqueRoomsMap.set( roomName, {
    //         //         id        : roomName,
    //         //         building    : this.#getBuilding( roomName ),
    //         //         capacity    : row.Capacidad,
    //         //         sizeValue   : this.#getCapacity( row.Capacidad, sizes ),
    //         //         spaceType   : this.#getSpaceType( roomName, row.Talla ),
    //         //     });
    //         // }

    //         // Professors
    //         const professorId = row.ProfesorId;
    //         if ( professorId && !uniqueProfessorsMap.has( professorId )) {
    //             uniqueProfessorsMap.set( professorId, {
    //                 id      : professorId.toString(),
    //                 name    : row.PROF.trim(),
    //             });
    //         }

    //         // Subjects
    //         const subjectCode = row.Sigla?.trim();
    //         if ( subjectCode && !uniqueSubjectsMap.has( subjectCode )) {
    //             uniqueSubjectsMap.set( subjectCode, {
    //                 id          : subjectCode,
    //                 name        : row.NombreAsignatura?.trim(),
    //                 startDate   : new Date( row.FechaInicio ),
    //             });
    //         }

    //         // Periods
    //         const periodName = `${row.PeriodoAcademicoId}-${row.TipoPeriodo?.trim()}`;
    //         if ( periodName && !uniquePeriodsMap.has( periodName )) {
    //             uniquePeriodsMap.set( periodName, {
    //                 id : row.PeriodoAcademicoId.toString(),
    //                 name: row.TipoPeriodo?.trim()
    //             });
    //         }

    //         // Sections
    //         const sectionId = ulid();

    //         sectionList.push({
    //             id                      : sectionId,
    //             code                    : row['Sec.'],
    //             session                 : row.Tipo as $Enums.Session,
    //             size                    : this.#getSize( row.Size, row.Capacidad ),
    //             correctedRegistrants    : row.Inscritos,
    //             realRegistrants         : row.InscritosOriginal,
    //             plannedBuilding         : row.Edificio,
    //             chairsAvailable         : row.SillasDisp,
    //             roomId                  : row.Sala,
    //             dayModuleId             : dayModules.find( dm => dm.dayId === row.Dia && dm.moduleId === row.Modulo )?.id || 1,
    //             professorId             : row.ProfesorId?.toString() || null,
    //             groupId                 : ulid()
    //         });

    //         // SSEC
    //         ssecList.push({
    //             sectionId,
    //             subjectId   : row.Sigla?.trim(),
    //             periodId    : row.PeriodoAcademicoId.toString(),
    //         });
    //     }

    //     // const newRoomsToCreate = await this.#getNewEntitiesToCreate(
    //     //     Array.from( uniqueRoomsMap.values() ),
    //     //     'id',
    //     //     this.room,
    //     //     'id',
    //     //     ( rData: RoomData ) => ({
    //     //         id          : rData.id,
    //     //         building    : rData.building,
    //     //         capacity    : rData.capacity,
    //     //         sizeId      : rData.sizeValue,
    //     //         type        : rData.spaceType,
    //     //     })
    //     // );

    //     // if ( newRoomsToCreate.length > 0 ) {
    //     //     await this.room.createMany({ data: newRoomsToCreate, skipDuplicates: true });
    //     // }

    //     const newProfessorsToCreate = await this.#getNewEntitiesToCreate(
    //         Array.from( uniqueProfessorsMap.values() ),
    //         'id',
    //         this.professor,
    //         'id',
    //         ( pData: ProfessorData ) => ({
    //             id      : pData.id,
    //             name    : pData.name,
    //         })
    //     );

    //     if ( newProfessorsToCreate.length > 0 ) {
    //         await this.professor.createMany({ data: newProfessorsToCreate, skipDuplicates: true });
    //     }

    //     const newPeriodsToCreate = await this.#getNewEntitiesToCreate(
    //         Array.from( uniquePeriodsMap.values() ),
    //         'id',
    //         this.period,
    //         'id',
    //         ( pData: PeriodData ) => ({
    //             id      : pData.id,
    //             name    : pData.name,
    //         })
    //     );

    //     if ( newPeriodsToCreate.length > 0 ) {
    //         await this.period.createMany({ data: newPeriodsToCreate, skipDuplicates: true });
    //     }

    //     const newSubjectsToCreate = await this.#getNewEntitiesToCreate(
    //         Array.from( uniqueSubjectsMap.values() ),
    //         'id',
    //         this.subject,
    //         'id',
    //         (sData: SubjectData) => ({
    //             id          : sData.id,
    //             name        : sData.name,
    //             startDate   : sData.startDate,
    //         })
    //     );

    //     if ( newSubjectsToCreate.length > 0 ) {
    //         await this.subject.createMany({ data: newSubjectsToCreate, skipDuplicates: true });
    //     }

    //     if ( sectionList.length > 0 ) {
    //         const inserted = await this.section.createMany({ data: sectionList, skipDuplicates: true });

    //         if ( inserted.count === 0 ) {
    //             throw new BadRequestException( 'No sections were inserted' );
    //         }

    //         if ( ssecList.length > 0 ) {
    //             await this.subjectSection.createMany({ data: ssecList });
    //         }
    //     }

    //     return this.#getSectionData();
    // }
}
