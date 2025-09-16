import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@app/config/prisma-catch';
import { CreateOfferDto }   from '@offers/dto/create-offer.dto';
import { UpdateOfferDto }   from '@offers/dto/update-offer.dto';


@Injectable()
export class OffersService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
        this.$connect();
    }


    #validDates( startDate: Date[] | undefined, endDate: Date[] | undefined ): void {
        if ( startDate?.length !== endDate?.length ) {
            throw new BadRequestException({
                code    : 'OFFER-002',
                message : 'Start date and end date must have the same length',
            });
        }
    }


    async create( createOfferDto: CreateOfferDto ) {
        if ( !createOfferDto.workshop
            && !createOfferDto.laboratory
            && !createOfferDto.tutoringSession
            && !createOfferDto.lecture
        ) {
            // 'At least one of the following must be filled: workshop, laboratory, tutoringSession'
            throw new BadRequestException({
                code    : 'OFFER-001',
                message : 'At least one of the following must be filled: workshop, laboratory, tutoringSession',
            });
        }

        this.#validDates( createOfferDto.startDate, createOfferDto.endDate );

        try {
            return await this.offer.create({
                data: createOfferDto,
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create subject' );
        }
    }


    findAll() {
        return this.offer.findMany();
    }


    findOne( id: string ) {
        return this.offer.findUnique({
            where: { id }
        });
    }


    update( id: string, updateOfferDto: UpdateOfferDto ) {
        this.#validDates( updateOfferDto.startDate, updateOfferDto.endDate );

        try {
            return this.offer.update({
                where   : { id },
                data    : updateOfferDto,
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update offer' );
        }
    }


    async remove( id: string ) {
        try {
            return await this.offer.delete({
                where: { id }
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete offer' );
        }
    }

}
