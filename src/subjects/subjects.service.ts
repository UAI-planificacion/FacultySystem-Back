import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@config/prisma-catch';
import { CreateSubjectDto } from '@subjects/dto/create-subject.dto';
import { UpdateSubjectDto } from '@subjects/dto/update-subject.dto';


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
}
