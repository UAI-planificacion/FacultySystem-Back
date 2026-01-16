import { Express } from 'express';

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
    Query
}                           from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiConsumes,
    ApiBody,
    ApiResponse
}                           from '@nestjs/swagger';
import { FileInterceptor }  from '@nestjs/platform-express';

import * as XLSX from 'xlsx';

import {
    BulkCreateSectionDto,
    IExcelSection
}                                   from '@sections/dto/excel-section.dto';
import { SectionsService }          from '@sections/sections.service';
import { CreateSectionDto }         from '@sections/dto/create-section.dto';
import { UpdateSectionDto }         from '@sections/dto/update-section.dto';
import { SectionDto }               from '@sections/dto/section.dto';
import { CleanSectionDto }          from '@sections/dto/clean-section.dto';
import { ChangeMassiveStatusDto }   from '@sections/dto/change-massive-status.dto';
import { Type }                     from '@sessions/interfaces/excelSession.dto';
import { SectionQuery }             from '@sections/dto/querys.dto';
// import { CreateInitialSectionDto }  from '@sections/dto/initial-section.dto';
// import { UpdateGroupDto }           from '@sections/dto/update-group.dto';

@ApiTags( 'Sections' )
@Controller( 'sections' )
export class SectionsController {

    constructor(
        private readonly sectionsService: SectionsService
    ) {}


    @Post( 'offer' )
    @ApiOperation({ summary: 'Create offer for many sections' })
    @ApiResponse({
        status      : 201,
        description : 'The sections has been successfully created.',
        type        : SectionDto
    })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    create(
        @Body() createSectionDto: CreateSectionDto
    ): Promise<SectionDto[]> {
        return this.sectionsService.createOfferSections( createSectionDto );
    }


    @Post( 'massive-offers' )
    @ApiOperation({ summary: 'Create offer for many sections' })
    @ApiResponse({
        status      : 201,
        description : 'The sections has been successfully created.',
        type        : SectionDto
    })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    massiveCreate(
        @Body() createSectionDto: CreateSectionDto[]
    ){
        return this.sectionsService.createMassiveOfferSections( createSectionDto );
    }

    /**
     * Upload Excel file and create section offers in bulk
     * @param file - Excel file containing section offers data
     * @returns Result of bulk creation with success/error details
     */
    @Post( 'massive-upload-offers' )
    @UseInterceptors( FileInterceptor( 'file' ) )
    @ApiConsumes( 'multipart/form-data' )
    @ApiBody({
        description : 'Excel file with section offers data',
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
    @ApiResponse({
        status      : 201,
        description : 'Excel file processed and sections created successfully',
        type        : [SectionDto]
    })
    @ApiResponse({ status: 400, description: 'Bad Request or invalid file format' })
    async uploadExcelOffers(
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
            const jsonData: IExcelSection[] = XLSX.utils.sheet_to_json( worksheet );

            if ( jsonData.length === 0 ) {
                throw new BadRequestException( 'Excel file is empty or has no valid data' );
            }

            // Validate required columns
            const requiredColumns   = [
                'periodId',
                'subjectId',
            ];
            const firstRow          = jsonData[0];
            const missingColumns    = requiredColumns.filter( col => !( col in firstRow ));

            if ( missingColumns.length > 0 ) {
                throw new BadRequestException( 
                    `Missing required columns: ${missingColumns.join( ', ' )}` 
                );
            }

            // Process data and convert to proper format
            const processedData: CreateSectionDto[] = jsonData.map(( row, index ) => {
                try {
                    const quota             = Number( row.quota )               || 0;
                    const workshop          = Number( row.taller )              || 0;
                    const lecture           = Number( row.catedra )             || 0;
                    const tutoringSession   = Number( row.ayudantia )           || 0;
                    const laboratory        = Number( row.laboratorio )         || 0;
                    const numberOfSections  = Number( row.numberOfSections )    || 1;

                    if ( numberOfSections < 1 ) {
                        throw new BadRequestException( 
                            `Row ${index + 2} has invalid numberOfSections value, must be at least 1` 
                        );
                    }

                    return {
                        periodId        : row.periodId?.toString().trim(),
                        subjectId       : row.subjectId?.toString().trim(),
                        professorId     : row.professorId?.toString().trim() || undefined,
                        quota           : quota,
                        spaceSizeId     : row.spaceSizeId   || undefined,
                        spaceType       : row.spaceType     || undefined,
                        startDate       : row.startDate     ? new Date( row.startDate ) : undefined,
                        endDate         : row.endDate       ? new Date( row.endDate )   : undefined,
                        building        : row.building      || undefined,
                        workshop,
                        lecture,
                        tutoringSession,
                        laboratory,
                        numberOfSections,
                    };
                } catch ( error ) {
                    throw new BadRequestException(
                        `Error processing row ${index + 2}: ${error.message}` 
                    );
                }
            });

            // Create bulk DTO
            const bulkCreateDto: BulkCreateSectionDto = {
                sections : processedData
            };

            // Process bulk creation
            return await this.sectionsService.createMassiveOfferSections( bulkCreateDto.sections );
        } catch ( error ) {
            if ( error instanceof BadRequestException ) {
                throw error;
            }

            throw new BadRequestException( 
                `Error processing Excel file: ${error.message}` 
            );
        }
    }


    @Get()
    @ApiOperation({ summary: 'Get all sections' })
    @ApiResponse({
        status      : 200,
        description : 'Return all sections',
        type        :  [SectionDto]
    })
    findAll(
        @Query() query: SectionQuery
    ) {
        return this.sectionsService.findAll( query );
    }


    @Get( 'sessions' )
    @ApiOperation({ summary: 'Get all sections' })
    @ApiResponse({
        status      : 200,
        description : 'Return all sections',
        type        :  [SectionDto]
    })
    findAllAndSessions(
        @Query() query: SectionQuery
    ) {
        return this.sectionsService.findAllAndSessions( query );
    }


    @Get( 'faculty/:id' )
    @ApiOperation({ summary: 'Get all sections by faculty id' })
    @ApiResponse({
        status      : 200,
        description : 'Return all sections',
        type        :  [SectionDto]
    })
    findAllByFacultyId(
        @Param( 'id' ) facultyId: string
    ) {
        return this.sectionsService.findAllByFacultyId( facultyId );
    }


    @Get( 'not-planning' )
    // @ApiOperation({ summary: 'Get all sections' })
    // @ApiResponse({ status: 200, description: 'Return all sections' })
    findSectionNotPlanning() {
        return this.sectionsService.findSectionNotPlanning();
    }

    @Get( 'planning' )
    // @ApiOperation({ summary: 'Get all sections' })
    // @ApiResponse({ status: 200, description: 'Return all sections' })
    findSectionPlanning() {
        return this.sectionsService.findSectionPlanning();
    }


    @Get( ':id' )
    @ApiOperation({ summary: 'Get a section by id' })
    @ApiResponse({ status: 200, description: 'Return the section' })
    @ApiResponse({ status: 404, description: 'Section not found' })
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.sectionsService.findOne( id );
    }


    @Patch( ':id' )
    @ApiOperation({ summary: 'Update a section' })
    @ApiResponse({ status: 200, description: 'The section has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Section not found' })
    update(
        @Param( 'id' ) id: string,
        @Body() updateSectionDto: UpdateSectionDto
    ) {
        return this.sectionsService.update( id, updateSectionDto );
    }


    @Patch( 'clean/:type' )
    @ApiOperation({ summary: 'Update a section' })
    @ApiResponse({ status: 200, description: 'The section has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Section not found' })
    clean(
        @Param( 'type' ) type: Type,
        @Body() resetSectionDto: CleanSectionDto,
    ) {
        return this.sectionsService.clean( type, resetSectionDto );
    }


    @Patch( 'changeStatus/:id' )
    @ApiOperation({ summary: 'Change section status (open/closed)' })
    @ApiResponse({ status: 200, description: 'The section status has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Section not found' })
    changeStatus(
        @Param( 'id' ) id: string,
    ) {
        return this.sectionsService.changeStatusSection( id );
    }


    @Patch( 'changeMassiveStatus/all' )
    @ApiOperation({ summary: 'Change multiple sections status (open/closed)' })
    @ApiResponse({
        status      : 200,
        description : 'The sections status has been successfully updated.',
        type        : [SectionDto]
    })
    @ApiResponse({ status: 404, description: 'Sections not found' })
    changeMassiveStatus(
        @Body() changeMassiveStatusDto: ChangeMassiveStatusDto
    ) {
        return this.sectionsService.changeMassiveStatusSection( changeMassiveStatusDto.sectionIds );
    }


    @Delete( ':id' )
    @ApiOperation({ summary: 'Delete a section' })
    @ApiResponse({ status: 200, description: 'The section has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Section not found' })
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.sectionsService.remove( id );
    }

}
