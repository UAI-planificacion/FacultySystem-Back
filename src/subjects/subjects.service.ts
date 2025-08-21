import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }      from '@config/prisma-catch';
import { CreateSubjectDto }     from '@subjects/dto/create-subject.dto';
import { UpdateSubjectDto }     from '@subjects/dto/update-subject.dto';
import { BulkCreateSubjectDto } from '@subjects/dto/excel-subject.dto';


@Injectable()
export class SubjectsService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }


    async create( createSubjectDto: CreateSubjectDto ) {
        if ( createSubjectDto.startDate.length !== createSubjectDto.endDate.length ) {
            throw new BadRequestException( 'Start date and end date must have the same length' );
        }

        try {
            return await this.subject.create({
                data: createSubjectDto,
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create subject' );
        }
    }


    async findAll( facultyId: string ) {
        return await this.subject.findMany({
            where: { facultyId }
        });
    }


    async findOne( id: string ) {
        const subject = await this.subject.findUnique({ 
            where: { id },
        });

        if ( !subject ) {
            throw new NotFoundException( 'Subject not found' );
        }

        return subject;
    }


    async update( id: string, updateSubjectDto: UpdateSubjectDto ) {
        if ( updateSubjectDto?.startDate?.length !== updateSubjectDto?.endDate?.length ) {
            throw new BadRequestException( 'Start date and end date must have the same length' );
        }

        try {
            return await this.subject.update({
                where: { id },
                data: {
                    name            : updateSubjectDto.name,
                    startDate       : updateSubjectDto.startDate,
                    endDate         : updateSubjectDto.endDate,
                    students        : updateSubjectDto.students,
                    costCenterId    : updateSubjectDto.costCenterId
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update subject' );
        }
    }


    async remove( id: string ) {
        try {
            return await this.subject.delete({ where: { id } });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete subject' );
        }
    }


    /**
     * Create multiple subjects from Excel data
     * @param bulkCreateSubjectDto - Bulk data containing array of subjects
     * @returns Array of created subjects with success/error status
     */
    async createBulk( bulkCreateSubjectDto: BulkCreateSubjectDto ) {
        const results: Array<{
            success : boolean;
            data    : any;
            row     : string;
        }> = [];
        
        const errors: Array<{
            success : boolean;
            error   : string;
            row     : string;
        }> = [];

        for ( const subjectData of bulkCreateSubjectDto.subjects ) {
            try {
                // Validate date arrays length
                if ( subjectData.startDate.length !== subjectData.endDate.length ) {
                    throw new BadRequestException( 
                        `Subject ${subjectData.name}: Start date and end date must have the same length` 
                    );
                }

                // Convert string dates to Date objects
                const startDate = subjectData.startDate.map( date => new Date( date ) );
                const endDate   = subjectData.endDate.map( date => new Date( date ) );

                // Create subject with converted dates
                const createdSubject = await this.subject.create({
                    data: {
                        id           : subjectData.id,
                        name         : subjectData.name,
                        startDate    : startDate,
                        endDate      : endDate,
                        students     : subjectData.students,
                        costCenterId : subjectData.costCenterId,
                        isEnglish    : subjectData.isEnglish || false,
                        facultyId    : subjectData.facultyId
                    }
                });

                results.push({
                    success : true,
                    data    : createdSubject,
                    row     : subjectData.name
                });

            } catch ( error ) {
                errors.push({
                    success : false,
                    error   : error.message || 'Unknown error',
                    row     : subjectData.name || 'Unknown subject'
                });
            }
        }

        return {
            totalProcessed  : bulkCreateSubjectDto.subjects.length,
            successful      : results.length,
            failed          : errors.length,
            results         : results,
            errors          : errors
        };
    }

}
