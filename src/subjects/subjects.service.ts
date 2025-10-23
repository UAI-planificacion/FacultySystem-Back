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


    #selectSubject = {
        id              : true,
        name            : true,
        spaceType       : true,
        spaceSizeId     : true,
        workshop        : true,
        lecture         : true,
        tutoringSession : true,
        laboratory      : true,
        createdAt       : true,
        updatedAt       : true,
        isActive        : true,
        grade           :  {
            select : {
                id              : true,
                name            : true,
                headquartersId  : true,
            }
        }
    }


    #subjectWithCounter = ( subject: any ) => ({
        id              : subject.id,
        name            : subject.name,
        spaceType       : subject.spaceType,
        spaceSizeId     : subject.spaceSizeId,
        workshop        : subject.workshop,
        lecture         : subject.lecture,
        tutoringSession : subject.tutoringSession,
        laboratory      : subject.laboratory,
        createdAt       : subject.createdAt,
        updatedAt       : subject.updatedAt,
        isActive        : subject.isActive,
        grade           : subject.grade,
    });


    async create( createSubjectDto: CreateSubjectDto ) {
        try {
            const subject = await this.subject.create({
                data    : createSubjectDto,
                select  : this.#selectSubject
            });

            return this.#subjectWithCounter( subject );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create subject' );
        }
    }


    async findAllByIds( ids: string[] ) {
        return await this.subject.findMany({
            where: {
                id: {
                    in: ids
                }
            },
            select: {
                id      : true,
                name    : true,
            }
        });
    }


    async findAll() {
        const subjects = await this.subject.findMany({
            select: this.#selectSubject
        });

        return subjects.map( subject => this.#subjectWithCounter( subject ));
    }


    async findAllByFacultyId( facultyId: string ) {
        const subjects = await this.subject.findMany({
            where   : { facultyId },
            select  : this.#selectSubject
        });

        return subjects.map( subject => this.#subjectWithCounter( subject ));
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
        try {
            const subject = await this.subject.update({
                where   : { id },
                data    : updateSubjectDto,
                select  : this.#selectSubject
            });

            return this.#subjectWithCounter( subject );
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
            return {
                id              : subjectData.id,
                name            : subjectData.name,
                spaceType       : subjectData.spaceType,
                spaceSizeId     : subjectData.spaceSizeId,
                facultyId
            };
        });

        if ( subjectsToCreate.length === 0 ) {
            throw new BadRequestException( 'No new subjects to create' );
        }

        try {
            await this.subject.createMany({ data: subjectsToCreate });

            const subjects = await this.subject.findMany({
                where: {
                    id: {
                        in: newSubjects.map( subject => subject.id )
                    }
                },
                select: this.#selectSubject
            });

            return subjects.map( subject => this.#subjectWithCounter( subject ));
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create subjects in bulk' );
        }
    }

}
