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
                where   : { id },
                data    : {
                    name            : updateSubjectDto.name,
                    startDate       : updateSubjectDto.startDate,
                    endDate         : updateSubjectDto.endDate,
                    students        : updateSubjectDto.students,
                    costCenterId    : updateSubjectDto.costCenterId,
                    isEnglish       : updateSubjectDto.isEnglish,
                    building        : updateSubjectDto.building,
                    spaceType       : updateSubjectDto.spaceType,
                    spaceSize       : updateSubjectDto.spaceSize,
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update subject' );
        }
    }


    async remove( id: string ) {
        try {
            return await this.subject.delete({ where: { id }});
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete subject' );
        }
    }


    /**
     * Create multiple subjects from Excel data using bulk insert
     * @param bulkCreateSubjectDto - Bulk data containing array of subjects
     * @param facultyId - Faculty ID to assign to all subjects
     * @returns Array of created subjects
     */
    async createBulk(
        bulkCreateSubjectDto    : BulkCreateSubjectDto,
        facultyId               : string
    ) {
        const inputIds          = bulkCreateSubjectDto.subjects.map( subject => subject.id );
        const existingSubjects  = await this.subject.findMany({
            where: {
                id: {
                    in: inputIds
                }
            },
            select: { id: true }
        });

        const existingIds = new Set( existingSubjects.map( subject => subject.id ));

        const newSubjects = bulkCreateSubjectDto.subjects.filter( 
            subject => !existingIds.has( subject.id )
        );

        const subjectsToCreate = newSubjects.map( subjectData => {
            if ( subjectData.startDate.length !== subjectData.endDate.length ) {
                throw new BadRequestException( 
                    `Subject ${subjectData.name}: Start date and end date must have the same length` 
                );
            }

            return {
                id           : subjectData.id,
                name         : subjectData.name,
                startDate    : subjectData.startDate,
                endDate      : subjectData.endDate,
                students     : subjectData.students,
                costCenterId : subjectData.costCenterId,
                isEnglish    : subjectData.isEnglish || false,
                building     : subjectData.building,
                spaceType    : subjectData.spaceType,
                spaceSize    : subjectData.spaceSize,
                facultyId
            };
        });

        if ( subjectsToCreate.length === 0 ) {
            throw new BadRequestException( 'No new subjects to create' );
        }

        try {
            await this.subject.createMany({ data: subjectsToCreate });

            return await this.subject.findMany({
                where: {
                    id: {
                        in: newSubjects.map( subject => subject.id )
                    }
                }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create subjects in bulk' );
        }
    }

}
