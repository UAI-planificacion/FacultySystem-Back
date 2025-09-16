import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }      from '@app/config/prisma-catch';
import { CreateProfessorDto }   from '@professors/dto/create-professor.dto';
import { UpdateProfessorDto }   from '@professors/dto/update-professor.dto';


@Injectable()
export class ProfessorsService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
		this.$connect();
	}


    create( createProfessorDto: CreateProfessorDto ) {
        try {
            const professor = this.professor.create({
                data: createProfessorDto
            });
            return professor;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    findAll() {
        return this.professor.findMany({});
    }


    findOne(id: string) {
        return this.professor.findUnique({ where: { id } });
    }


    async update(id: string, updateProfessorDto: UpdateProfessorDto) {
        try {
            const professor = await this.professor.update({
                where: { id },
                data: updateProfessorDto
            });

            return professor;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    async remove( id: string ) {
        try {
            const professor = await this.professor.delete({ where: { id }});

            return professor;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }

}
