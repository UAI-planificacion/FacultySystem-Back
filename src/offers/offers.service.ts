import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

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


    #selectOffer = {
        id              : true,
        startDate       : true,
        endDate         : true,
        workshop        : true,
        laboratory      : true,
        tutoringSession : true,
        lecture         : true,
        building        : true,
        costCenterId    : true,
        isEnglish       : true,
        spaceType       : true,
        period          : {
            select : {
                id      : true,
                name    : true,
            }
        },
        spaceSize       : {
            select : {
                id      : true,
                detail  : true,
            }
        },
        subject         : {
            select : {
                id      : true,
                name    : true,
            }
        },
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
                select: this.#selectOffer,
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create subject' );
        }
    }


    async findAll() {
        return await this.offer.findMany({
            select: this.#selectOffer,
        });
    }


    async findAllByFacultyId( facultyId: string ) {
        return await this.offer.findMany({
            where: {
                subject: {
                    facultyId
                }
            },
            select: this.#selectOffer,
        });
    }


    findOne( id: string ) {
        const offer = this.offer.findUnique({
            where: { id },
            select: this.#selectOffer,
        });

        if ( !offer ) {
            throw new NotFoundException({
                code    : 'OFFER-003',
                message : 'Offer not found',
            });
        }

        return offer;
    }


    update( id: string, updateOfferDto: UpdateOfferDto ) {
        this.#validDates( updateOfferDto.startDate, updateOfferDto.endDate );

        try {
            return this.offer.update({
                where   : { id },
                data    : updateOfferDto,
                select  : this.#selectOffer,
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update offer' );
        }
    }


    async remove( id: string ) {
        try {
            return await this.offer.delete({
                where: { id },
                select: this.#selectOffer,
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete offer' );
        }
    }

}
