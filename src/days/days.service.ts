import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@app/config/prisma-catch';
import { UpdateDayDto }     from '@days/dto/update-day.dto';
import { CreateDayDto }     from '@days/dto/create-day.dto';


@Injectable()
export class DaysService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }


    async create( createDayDto: CreateDayDto ) {
        try {
            const findAll = await this.findAll();

            if ( findAll.length >= 7 ) {
                throw new BadRequestException( 'Only 7 days are allowed' );
            }

            const day = await this.day.create({ data: createDayDto });
            return day;
        } catch (error) {
            throw PrismaException.catch( error );
        }
    }


    findAll() {
        return this.day.findMany({
            orderBy: {
                id: 'asc'
            }
        });
    }


    findOne( id: number ) {
        return this.day.findUnique({ where: { id } });
    }


    async update( id: number, updateDayDto: UpdateDayDto ) {
        try {
            const day = await this.day.update({
                where: { id },
                data: updateDayDto
            });
            return day;
        } catch (error) {
            throw PrismaException.catch( error );
        }
    }

}
