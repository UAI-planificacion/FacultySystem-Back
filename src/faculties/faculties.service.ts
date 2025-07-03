import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@app/config/prisma-catch';
import { CreateFacultyDto } from '@faculties/dto/create-faculty.dto';
import { UpdateFacultyDto } from '@faculties/dto/update-faculty.dto';


@Injectable()
export class FacultiesService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }

    async create( createFacultyDto: CreateFacultyDto ) {
        try {
            return await this.faculty.create({ data: createFacultyDto });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to create faculty' );
        }
    }


    async findAll() {
        return await this.faculty.findMany();
    }


    async findOne( id: string ) {
        const faculty = await this.faculty.findUnique({ where: { id } });

        if ( !faculty ) {
            throw new NotFoundException( 'Faculty not found' );
        }

        return faculty;
    }


    async update( id: string, updateFacultyDto: UpdateFacultyDto ) {
        try {
            return await this.faculty.update({ where: { id }, data: updateFacultyDto });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to update faculty' );
        }
    }


    async remove( id: string ) {
        try {
            return await this.faculty.delete({ where: { id } });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to delete faculty' );
        }
    }

}
