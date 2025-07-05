import { Injectable, OnModuleInit } from '@nestjs/common';

import { ulid }         from 'ulid';
import { PrismaClient } from 'generated/prisma';

import { PrismaException }      from '@app/config/prisma-catch';
import { CreateProfessorDto }   from '@professors/dto/create-professor.dto';
import { UpdateProfessorDto }   from '@professors/dto/update-professor.dto';


@Injectable()
export class ProfessorsService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }


    async create( createProfessorDto: CreateProfessorDto ) {
        try {
            const professor = await this.professor.create({
                data: {
                    ...createProfessorDto,
                    id: ulid()
                }
            });

            return professor;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create professor' );
        }
    }


    async findAll() {
        return await this.professor.findMany();
    }


    async findOne( id: string ) {
        return await this.professor.findUnique({ where: { id } });
    }


    async update( id: string, updateProfessorDto: UpdateProfessorDto ) {
        try {
            const professor = await this.professor.update({ where: { id }, data: updateProfessorDto });
            return professor;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update professor' );
        }
    }


    async remove( id: string ) {
        try {
            const professor = await this.professor.delete({ where: { id } });
            return professor;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete professor' );
        }
    }

}
