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
    ParseUUIDPipe,
    BadRequestException
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

import { SectionsService }          from '@sections/sections.service';
import { CreateSectionDto }         from '@sections/dto/create-section.dto';
import { UpdateSectionDto }         from '@sections/dto/update-section.dto';
import { SectionDto }               from '@sections/dto/section.dto';
import { CreateInitialSectionDto }  from '@sections/dto/initial-section.dto';
import { UpdateGroupDto }           from '@sections/dto/update-group.dto';
import {
    BulkCreateSectionDto,
    IExcelSection
}                                   from '@sections/dto/excel-section.dto';

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
                'spaceSizeId',
                'spaceType',
                'startDate',
                'endDate',
                'numberOfSections'
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
                    const workshop          = Number( row.workshop )         || 0;
                    const lecture           = Number( row.lecture )          || 0;
                    const tutoringSession   = Number( row.tutoringSession )  || 0;
                    const laboratory        = Number( row.laboratory )       || 0;
                    const numberOfSections  = Number( row.numberOfSections ) || 1;

                    if ( numberOfSections < 1 ) {
                        throw new BadRequestException( 
                            `Row ${index + 2} has invalid numberOfSections value, must be at least 1` 
                        );
                    }

                    return {
                        periodId        : row.periodId?.toString().trim(),
                        subjectId       : row.subjectId?.toString().trim(),
                        professorId     : row.professorId?.toString().trim() || undefined,
                        spaceSizeId     : row.spaceSizeId || undefined,
                        spaceType       : row.spaceType || undefined,
                        startDate       : new Date( row.startDate ),
                        endDate         : new Date( row.endDate ),
                        building        : row.building || undefined,
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
    findAll() {
        return this.sectionsService.findAll();
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


    // @Patch( 'massive/:ids' )
    // @ApiOperation({ summary: 'Update a section' })
    // @ApiResponse({ status: 200, description: 'The section has been successfully updated.' })
    // @ApiResponse({ status: 404, description: 'Section not found' })
    // massiveUpdate(
    //     @Param( 'ids' ) ids: string,
    //     @Body() updateSectionDto: UpdateSectionDto
    // ) {
    //     return this.sectionsService.massiveUpdate( ids.split(','), updateSectionDto );
    // }


    // @Patch( 'groupId/:id' )
    // @ApiOperation({ summary: 'Update a section' })
    // @ApiResponse({ status: 200, description: 'The section has been successfully updated.' })
    // @ApiResponse({ status: 404, description: 'Section not found' })
    // updateByGroup(
    //     @Param( 'id', ParseUUIDPipe ) id: string,
    //     @Body() updateGroupDto: UpdateGroupDto
    // ) {
    //     return this.sectionsService.updateByGroup( id, updateGroupDto );
    // }


    @Patch( 'changeStatus/:id' )
    @ApiOperation({ summary: 'Update a section' })
    @ApiResponse({ status: 200, description: 'The section has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Section not found' })
    changeStatusGroup(
        @Param( 'id' ) id: string,
    ) {
        return this.sectionsService.changeStatusSection( id );
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


    // @Delete( 'groupId/:id' )
    // @ApiOperation({ summary: 'Delete a section by group id' })
    // @ApiResponse({ status: 200, description: 'The section has been successfully deleted.' })
    // @ApiResponse({ status: 404, description: 'Section not found' })
    // removeByGroupId(
    //     @Param( 'id' ) id: string
    // ) {
    //     return this.sectionsService.removeByGroupId( id );
    // }


    // @Post( 'create-massive-by-subject/:id' )
    // @ApiOperation({ summary: 'Create multiple sections for a specific subject' })
    // @ApiResponse({ 
    //     status: 201, 
    //     description: 'The sections have been successfully created.',
    //     type: [SectionDto]
    // })
    // @ApiResponse({ status: 400, description: 'Bad Request or validation error.' })
    // createMassive(
    //     @Param( 'id' ) subjectId            : string,
    //     @Body() createInitialSectionDtos    : CreateInitialSectionDto[]
    // ) {
    //     return this.sectionsService.createBasic( subjectId, createInitialSectionDtos );
    // }

}
