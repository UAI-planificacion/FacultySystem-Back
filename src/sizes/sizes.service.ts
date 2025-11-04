import { BadRequestException, ConflictException, Injectable, OnModuleInit } from '@nestjs/common';

import { $Enums, Prisma, PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@app/config/prisma-catch';
import { CreateSizeDto }    from '@sizes/dto/create-size.dto';
import { UpdateSizeDto }    from '@sizes/dto/update-size.dto';


@Injectable()
export class SizesService extends PrismaClient implements OnModuleInit {

    async onModuleInit() {
        await this.$connect();
    }


    async #validateSize( dto: CreateSizeDto | UpdateSizeDto, idToExclude?: $Enums.SizeValue ) {
        // Validación básica del DTO
        if ( dto.min != null && dto.max != null && dto.min >= dto.max ) {
            throw new BadRequestException('El valor "min" debe ser menor que el valor "max".');
        }

        const orConditions: Prisma.SizeWhereInput[] = [];

        // Caso 1: El DTO define un rango (min y max)
        if ( dto.min != null && dto.max != null ) {
            orConditions.push(
                // Choca con otro rango
                { min: { lte: dto.max }, max: { gte: dto.min }},
                // Choca con un "lessThan" (ej: nuevo es 20-30, existente es < 50)  
                { lessThan: { gt: dto.min }},
                // Choca con un "greaterThan" (ej: nuevo es 80-90, existente es > 70)
                { greaterThan: { lt: dto.max }}
            );
        }

        // Caso 2: El DTO define un "lessThan"  
        if ( dto.lessThan != null ) {
            orConditions.push(
                // Choca con un rango (ej: nuevo es < 50, existente es 20-30)
                { min: { lt: dto.lessThan }},
                // Choca con cualquier otro "lessThan" 
                { lessThan: { not: null }},
                // Choca con un "greaterThan" inconsistente (ej: nuevo es < 30, existente es > 20)
                { greaterThan: { lt: dto.lessThan }}
            );
        }

        // Caso 3: El DTO define un "greaterThan"
        if ( dto.greaterThan != null ) {
            orConditions.push(
                // Choca con un rango (ej: nuevo es > 70, existente es 80-90)
                { max: { gt: dto.greaterThan }},
                // Choca con cualquier otro "greaterThan"
                { greaterThan: { not: null }},
                // Choca con un "lessThan" inconsistente (ej: nuevo es > 70, existente es < 80)
                { lessThan: { gt: dto.greaterThan }}
            );
        }

        const conflictingSize = await this.size.findFirst({
            where: {
                // Si estamos actualizando, excluimos la propia talla de la búsqueda
                ...( idToExclude && { id: { not: idToExclude }}),
                // Aplicamos todas las condiciones de solapamiento
                OR: orConditions,
            }
        });

        if ( conflictingSize ) {
            throw new ConflictException(
                `El rango definido se solapa con la talla existente: "${conflictingSize.id}" (${conflictingSize.detail}).`
            );
        }
    }


    #generateDetail( dto: CreateSizeDto | UpdateSizeDto ): string {
        const { min, max, lessThan, greaterThan } = dto;

        if ( lessThan )     return `< ${lessThan}`;
        if ( greaterThan )  return `> ${greaterThan}`;

        return `${min} - ${max}`;
    }


    async create( createSizeDto: CreateSizeDto ) {
        await this.#validateSize( createSizeDto );

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
        await this.#validateSize( updateSizeDto, id );

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
