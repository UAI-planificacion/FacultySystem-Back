import { 
	Controller, 
	Get, 
	Post, 
	Body, 
	Patch, 
	Param, 
	Delete, 
	UploadedFile, 
	UseInterceptors,
	BadRequestException
}                               from '@nestjs/common';
import { FileInterceptor }      from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

import * as XLSX from 'xlsx';

import {
    BulkCreateSubjectDto,
    IExcelSubject
}                           from '@subjects/dto/excel-subject.dto';
import { SubjectsService }  from '@subjects/subjects.service';
import { CreateSubjectDto } from '@subjects/dto/create-subject.dto';
import { UpdateSubjectDto } from '@subjects/dto/update-subject.dto';


@Controller( 'subjects' )
export class SubjectsController {

    constructor(
        private readonly subjectsService: SubjectsService
    ) {}


    @Post()
    create(
        @Body() createSubjectDto: CreateSubjectDto
    ) {
        return this.subjectsService.create( createSubjectDto );
    }


    @Get()
    findAll(
    ) {
        return this.subjectsService.findAll();
    }


    @Get( '/ids/:ids' )
    findAllByIds(
        @Param( 'ids' ) ids: string
    ) {
        return this.subjectsService.findAllByIds( ids.split( ',' ));
    }


    @Get( 'all/:facultyId' )
    findAllByFacultyId(
        @Param( 'facultyId' ) facultyId: string
    ) {
        return this.subjectsService.findAllByFacultyId( facultyId );
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.subjectsService.findOne( id );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id: string,
        @Body() updateSubjectDto: UpdateSubjectDto
    ) {
        return this.subjectsService.update( id, updateSubjectDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.subjectsService.remove( id );
    }


    /**
     * Upload Excel file and create subjects in bulk
     * @param file - Excel file containing subjects data
     * @returns Result of bulk creation with success/error details
     */
    @Post( 'bulk-upload/:facultyId' )
    @UseInterceptors( FileInterceptor( 'file' ) )
    @ApiConsumes( 'multipart/form-data' )
    @ApiBody({
        description : 'Excel file with subjects data',
        schema      : {
            type       : 'object',
            properties : {
                file : {
                    type   : 'string',
                    format : 'binary'
                }
            }
        }
    })
    async uploadExcel(
        @Param( 'facultyId' ) facultyId: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        if ( !file ) {
            throw new BadRequestException( 'No file uploaded' );
        }

        if ( !file.originalname.match( /\.(xlsx|xls)$/ ) ) {
            throw new BadRequestException( 'Only Excel files are allowed' );
        }

        try {
            // Read Excel file
            const workbook  = XLSX.read( file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const jsonData: IExcelSubject[] = XLSX.utils.sheet_to_json( worksheet );

            if ( jsonData.length === 0 ) {
                throw new BadRequestException( 'Excel file is empty or has no valid data' );
            }

            // Validate required columns
            const requiredColumns   = ['id', 'name'];
            const firstRow          = jsonData[0];
            const missingColumns    = requiredColumns.filter( col => !( col in firstRow ));

            if ( missingColumns.length > 0 ) {
                throw new BadRequestException( 
                    `Missing required columns: ${missingColumns.join( ', ' )}` 
                );
            }

            // Process data and convert to proper format
            const processedData = jsonData.map(( row, index ) => {
                try {
                    const workshop          = Number( row.taller )      || 0;
                    const lecture           = Number( row.catedra )     || 0;
                    const tutoringSession   = Number( row.ayudantia )   || 0;
                    const laboratory        = Number( row.laboratorio ) || 0;

                    if ( workshop === 0 && lecture === 0 && tutoringSession === 0 && laboratory === 0 ) {
                        throw new BadRequestException( 
                            `Row ${index + 2} has no valid data, check the values` 
                        );
                    }

                    return {
                        facultyId,
                        id          : row.id.trim(),
                        name        : row.name.trim(),
                        spaceType   : row.spaceType,
                        spaceSizeId : row.spaceSize,
                        gradeId     : row.grade,
                        workshop,
                        lecture,
                        tutoringSession,
                        laboratory,
                    };
                } catch ( error ) {
                    throw new BadRequestException(
                        `Error processing row ${index + 2}: ${error.message}` 
                    );
                }
            });

            // Create bulk DTO
            const bulkCreateDto: BulkCreateSubjectDto = {
                subjects : processedData
            };

            // Process bulk creation
            return await this.subjectsService.createBulk( bulkCreateDto, facultyId );
        } catch ( error ) {
            if ( error instanceof BadRequestException ) {
                throw error;
            }
            throw new BadRequestException( 
                `Error processing Excel file: ${error.message}` 
            );
        }
    }

}
