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


    @Get( 'all/:facultyId' )
    findAll(
        @Param( 'facultyId' ) facultyId: string
    ) {
        return this.subjectsService.findAll( facultyId );
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
    @Post( 'bulk-upload' )
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
            const workbook = XLSX.read( file.buffer, { type: 'buffer' } );
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON
            const jsonData: IExcelSubject[] = XLSX.utils.sheet_to_json( worksheet );

            if ( jsonData.length === 0 ) {
                throw new BadRequestException( 'Excel file is empty or has no valid data' );
            }

            // Validate required columns
            const requiredColumns = ['id', 'name', 'students', 'costCenterId', 'facultyId'];
            const firstRow = jsonData[0];
            const missingColumns = requiredColumns.filter( col => !( col in firstRow ) );

            if ( missingColumns.length > 0 ) {
                throw new BadRequestException( 
                    `Missing required columns: ${missingColumns.join( ', ' )}` 
                );
            }

            // Process data and convert to proper format
            const processedData = jsonData.map( ( row, index ) => {
                try {
                    return {
                        id           : String( row.id || '' ).trim(),
                        name         : String( row.name || '' ).trim(),
                        startDate    : this.#parseArrayField( row.startDate ),
                        endDate      : this.#parseArrayField( row.endDate ),
                        students     : Number( row.students ) || 0,
                        costCenterId : String( row.costCenterId || '' ).trim(),
                        isEnglish    : Boolean( row.isEnglish ) || false,
                        facultyId    : String( row.facultyId || '' ).trim()
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
            return await this.subjectsService.createBulk( bulkCreateDto );

        } catch ( error ) {
            if ( error instanceof BadRequestException ) {
                throw error;
            }
            throw new BadRequestException( 
                `Error processing Excel file: ${error.message}` 
            );
        }
    }


    /**
     * Parse array field from Excel (handles comma-separated values or arrays)
     * @param field - Field value from Excel
     * @returns Array of strings
     */
    #parseArrayField( field: any ): string[] {
        if ( !field ) return [];
        
        if ( Array.isArray( field ) ) {
            return field.map( item => String( item ).trim() );
        }
        
        if ( typeof field === 'string' ) {
            return field.split( ',' ).map( item => item.trim() ).filter( item => item.length > 0 );
        }
        
        return [String( field ).trim()];
    }

}
