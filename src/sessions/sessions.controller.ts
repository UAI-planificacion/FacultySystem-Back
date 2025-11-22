import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Header,
    StreamableFile,
    Query,
}                               from '@nestjs/common';
import { FileInterceptor }      from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

import * as XLSX from 'xlsx';

import {
    ExcelSectionDto,
    ExcelSessionDto,
    SectionDataDto,
    SessionDataDto,
    Type
}                                       from '@sessions/interfaces/excelSession.dto';
import { SessionsService }              from '@sessions/sessions.service';
import { CreateSessionDto }             from '@sessions/dto/create-session.dto';
import { UpdateSessionDto }             from '@sessions/dto/update-session.dto';
import { CreateMassiveSessionDto }      from '@sessions/dto/create-massive-session.dto';
import { MassiveUpdateSessionDto }      from '@sessions/dto/massive-update-session.dto';
import { CalculateAvailabilityDto }     from '@sessions/dto/calculate-availability.dto';
import { AvailableSessionDto }          from '@sessions/dto/available-session.dto';
import { AssignSessionAvailabilityDto } from '@sessions/dto/assign-session-availability.dto';


@Controller( 'sessions' )
export class SessionsController {

    constructor(
        private readonly sessionsService: SessionsService
    ) {}


    @Post()
    create(
        @Body() createSessionDto: CreateSessionDto
    ) {
        return this.sessionsService.create( createSessionDto );
    }


    @Post( 'massive/:sectionId' )
    createMassive(
        @Param( 'sectionId' ) sectionId: string,
        @Body() createMassiveSessionDto: CreateMassiveSessionDto[]
    ) {
        return this.sessionsService.createMassive( sectionId, createMassiveSessionDto );
    }


    @Get( 'without-reservation/:type' )
    @Header( 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' )
    async findSessionsWithoutReservation(
        @Param( 'type' ) type: Type,
    ): Promise<StreamableFile> {
        if ( ![ Type.SPACE, Type.PROFESSOR, Type.REGISTERED ].includes( type )) {
            throw new BadRequestException( 'Invalid type parameter. Must be "space", "professor" or "registered"' );
        }

        const buffer = await this.sessionsService.exportSessionsWithoutAssignment( type );

        return new StreamableFile( buffer, {
            type        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            disposition : `attachment; filename="sessions-without-${type}.xlsx"`,
        });
    }


    @Get()
    findAll() {
        return this.sessionsService.findAll();
    }


    @Get( 'section/:sectionId' )
    findBySectionId(
        @Param( 'sectionId' ) sectionId: string
    ) {
        return this.sessionsService.findBySectionId( sectionId );
    }


    @Post( 'calculate-availability/:sectionId' )
    calculateAvailability(
        @Param( 'sectionId' ) sectionId: string,
        @Body() calculateAvailabilityDto: CalculateAvailabilityDto[]
    ) {
        return this.sessionsService.calculateSessionAvailability( sectionId, calculateAvailabilityDto );
    }


    @Post( 'availables' )
    findAvailableSessions(
        @Body() availableSessionDto: AvailableSessionDto
    ) {
        return this.sessionsService.findAvailableSessions( availableSessionDto );
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.sessionsService.findOne( id );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id: string,
        @Body() updateSessionDto: UpdateSessionDto
    ) {
        return this.sessionsService.update( id, updateSessionDto );
    }


    @Patch( 'update/massive' )
    massiveUpdate(
        @Body() updateSessionDto: MassiveUpdateSessionDto
    ) {
        return this.sessionsService.massiveUpdate( updateSessionDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.sessionsService.remove( id );
    }


    @Delete( 'massive/:ids' )
    massiveRemove(
        @Param( 'ids' ) ids: string
    ) {
        return this.sessionsService.massiveRemove( ids.split( ',' ) );
    }

    /**
     * Upload Excel file and create subjects in bulk
     * @param file - Excel file containing subjects data
     * @returns Result of bulk creation with success/error details
     */
    // @Post( 'bulk-upload/:type' )
    @Post( 'bulk-upload' )
    @UseInterceptors( FileInterceptor( 'file' ) )
    @ApiConsumes( 'multipart/form-data' )
    // @ApiBody({
    //     description : 'Excel file with subjects data',
    //     schema      : {
    //         type       : 'object',
    //         properties : {
    //             file : {
    //                 type   : 'string',
    //                 format : 'binary'
    //             }
    //         }
    //     }
    // })
    async uploadExcel(
        @UploadedFile() file: Express.Multer.File
    ) {
        if ( !file ) {
            throw new BadRequestException( 'No file uploaded' );
        }

        if ( !file.originalname.match( /\.(xlsx|xls)$/ )) {
            throw new BadRequestException( 'Only Excel files are allowed' );
        }

        try {
            // 1. Leer el archivo Excel
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });

            // 2. ✅ Extraer el tipo desde la hoja _meta
            const metaSheet = workbook.Sheets[ '_meta' ];

            if ( !metaSheet ) {
                throw new BadRequestException(
                    'Archivo inválido. No contiene metadata (_meta). ' +
                    'Asegúrate de usar el archivo generado por el sistema.'
                );
            }

            // Read Excel file
            // const workbook  = XLSX.read( file.buffer, { type: 'buffer' });
            const metaData  = XLSX.utils.sheet_to_json(metaSheet, { header: 1 }) as any[][];
            const typeRow   = metaData.find( row => row[0] === 'type' );
            const type      : Type = typeRow ? typeRow[1] : null;

            if ( !type || ![ Type.SPACE, Type.PROFESSOR, Type.REGISTERED ].includes( type )) {
                throw new BadRequestException(
                    'No se pudo determinar el tipo del archivo desde metadata. ' +
                    'Tipo detectado: ' + ( type || 'ninguno' )
                );
            }

            // 3. Leer la hoja principal (Sessions)
            const sheetName = workbook.SheetNames[ 0 ];

            if ( !sheetName ) {
                throw new BadRequestException( 'El archivo no contiene la hoja "Sessions"' );
            }

            const worksheet = workbook.Sheets[ sheetName ];

            // Convert to JSON
            const jsonData: ExcelSessionDto[] | ExcelSectionDto[] = XLSX.utils.sheet_to_json( worksheet ) as any;

            if ( jsonData.length === 0 ) {
                throw new BadRequestException( 'Excel file is empty or has no valid data' );
            }

            // Validate required columns
            // const requiredColumns   = ['SSEC', 'SesionId',  type === 'space' ? 'Espacio' : 'Profesor'];
            const requiredColumnsRegisted = [ 'SectionId', 'Inscritos' ];
            const requiredColumns   = type === Type.REGISTERED ? requiredColumnsRegisted : [ 'SSEC', 'SesionId' ];
            const firstRow          = jsonData[ 0 ];
            const missingColumns    = requiredColumns.filter( col => !( col in firstRow ));

            if ( missingColumns.length > 0 ) {
                throw new BadRequestException(
                    `Missing required columns: ${ missingColumns.join( ', ' )}`
                );
            }

            let dataList : SessionDataDto[] | SectionDataDto[] = [];

            if (  type === Type.REGISTERED ) {
                dataList = jsonData.map(row => ({
                    sectionId   : row.SectionId || row[ 'sectionId' ],
                    registered  : row.Inscritos || row[ 'registered' ],
                }));
            }
            else {
                dataList = jsonData.map(row => ({
                    sessionId : row.SesionId || row[ 'sessionId' ],
                    ...( type === Type.SPACE
                        ? { spaceId: row.Espacio || row[ 'sessionId' ]}
                        : { professor: row.Profesor
                            ? { id: row.Profesor, name: '' }
                            : undefined
                        }
                    )
                }));
            }

            return await this.sessionsService.calculateSessionAvailabilitySpaceOrProfessorOrRegister(  
                type,  
                dataList  
            );
        } catch ( error ) {
            if ( error instanceof BadRequestException ) {
                throw error;
            }

            throw new BadRequestException( 
                `Error processing Excel file: ${ error.message }` 
            );
        }
    }


    @Patch( 'availability/assign' )
    @ApiBody({
        description : 'Listado de sesiones con la disponibilidad a asignar',
        type        : AssignSessionAvailabilityDto,
        isArray     : true
    })
    assignAvailability(
        @Query( 'seamlessly' ) seamlessly: boolean = true,
        @Body() assignments: AssignSessionAvailabilityDto[]
    ) {
        return this.sessionsService.assignSessionAvailability(
            seamlessly,
            assignments
        );
    }


    @Patch( 'availability/assign-registered' )
    @ApiBody({
        description : 'Listado de secciones con los registrados a asignar',
        type        : SectionDataDto,
        isArray     : true
    })
    assignRegistered(
        @Body() sectionDataList: SectionDataDto[]
    ) {
        return this.sessionsService.assignRegistered( sectionDataList );
    }

}
