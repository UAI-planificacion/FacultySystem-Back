import { Injectable, OnModuleInit } from '@nestjs/common';

import { $Enums, PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@app/config/prisma-catch';
import { CreateSizeDto }    from '@sizes/dto/create-size.dto';
import { UpdateSizeDto }    from '@sizes/dto/update-size.dto';


@Injectable()
export class SizesService extends PrismaClient implements OnModuleInit {

    async onModuleInit() {
        await this.$connect();
    }


    #generateDetail( dto: CreateSizeDto | UpdateSizeDto ): string {
        const { min, max, lessThan, greaterThan } = dto;

        if ( lessThan )     return `< ${lessThan}`;
        if ( greaterThan )  return `> ${greaterThan}`;

        return `${min} - ${max}`;
    }


    async create( createSizeDto: CreateSizeDto ) {
        try {
            const size = await this.size.create({
                data:  {
                    ...createSizeDto,
                    id: createSizeDto.id as $Enums.SizeValue,
                    detail: this.#generateDetail( createSizeDto ),
                },
            });
            return size;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    findAll() {
        return this.size.findMany({});
    }


    findOne( id: $Enums.SizeValue ) {
        return this.size.findUnique({ where: { id }});
    }


    async update( id: $Enums.SizeValue, updateSizeDto: UpdateSizeDto ) {
        try {
            const size = await this.size.update({
                where: { id },
                data: {
                    ...updateSizeDto,
                    detail: this.#generateDetail( updateSizeDto ),
                }
            });
            return size;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }


    async remove( id: $Enums.SizeValue ) {
        try {
            const size = await this.size.delete({ where: { id }});
            return size;
        } catch ( error ) {
            throw PrismaException.catch( error );
        }
    }

}
