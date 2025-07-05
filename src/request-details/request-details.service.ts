import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';

import { CreateRequestDetailDto }   from '@request-details/dto/create-request-detail.dto';
import { UpdateRequestDetailDto }   from '@request-details/dto/update-request-detail.dto';
import { PrismaClient }             from 'generated/prisma';

import { PrismaException } from '@app/config/prisma-catch';


@Injectable()
export class RequestDetailsService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }


    async create( createRequestDetailDto: CreateRequestDetailDto ) {
        try {
            return await this.requestDetail.create({ data: createRequestDetailDto });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create request detail' );
        }
    }


    async findAll( requestId: string ) {
        return await this.requestDetail.findMany({ where: { requestId }});
    }


    async findOne( id: string ) {
        const requestDetail = await this.requestDetail.findUnique({ where: { id }});

        if ( !requestDetail ) {
            throw new NotFoundException( 'Request detail not found' );
        }

        return requestDetail;
    }


    async update( id: string, updateRequestDetailDto: UpdateRequestDetailDto ) {
        try {
            return await this.requestDetail.update({ where: { id }, data: updateRequestDetailDto });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update request detail' );
        }
    }


    async remove( id: string ) {
        try {
            return await this.requestDetail.delete({ where: { id }});
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete request detail' );
        }
    }

}
