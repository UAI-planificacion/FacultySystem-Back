import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException } from '@app/config/prisma-catch';
import { CreatePeriodDto } from '@periods/dto/create-period.dto';
import { UpdatePeriodDto } from '@periods/dto/update-period.dto';


@Injectable()
export class PeriodsService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
        this.$connect();
    }

    create( createPeriodDto: CreatePeriodDto ) {
        try {
            const period = this.period.create({
                data: createPeriodDto
            });

            return period;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }

    findAll() {
        return this.period.findMany( {} );
    }


    findOne( id: string ) {
        return this.period.findUnique({ where: { id }});
    }


    async update(
        id              : string,
        updatePeriodDto : UpdatePeriodDto
    ) {
        try {
            const period = await this.period.update({
                where: { id },
                data: updatePeriodDto
            });

            return period;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    async remove( id: string ) {
        try {
            const period = await this.period.delete({ where: { id }});

            return period;
        } catch (error) {
            throw PrismaException.catch( error );
        }
    }

}
