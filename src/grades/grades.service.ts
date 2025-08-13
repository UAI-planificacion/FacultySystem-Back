import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@config/prisma-catch';
import { CreateGradeDto }   from '@grades/dto/create-grade.dto';
import { UpdateGradeDto }   from '@grades/dto/update-grade.dto';


@Injectable()
export class GradesService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
        this.$connect();
    }


    async create( createGradeDto: CreateGradeDto ) {
        try {
            const grade = await this.grade.create({
                data: createGradeDto
            })

            return grade;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create grade' );
        }
    }


    async findAll() {
        return await this.grade.findMany();
    }


    async findOne( id: string ) {
        return await this.grade.findUnique({
            where: { id }
        });
    }


    async update( id: string, updateGradeDto: UpdateGradeDto ) {
        try {
            const grade = await this.grade.update({
                where: { id },
                data: updateGradeDto
            });

            return grade;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update grade' );
        }
    }


    async remove( id: string ) {
        try {
            await this.grade.delete({
                where: { id }
            });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to delete grade' );
        }
    }

}
