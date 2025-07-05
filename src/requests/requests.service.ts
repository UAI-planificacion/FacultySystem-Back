import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@app/config/prisma-catch';
import { CreateRequestDto } from '@requests/dto/create-request.dto';
import { UpdateRequestDto } from '@requests/dto/update-request.dto';


@Injectable()
export class RequestsService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }


    async create( createRequestDto: CreateRequestDto ) {
        const { details, ...rest } = createRequestDto;

        try {
            const request       = await this.request.create({ data: rest });
            const detailsData   = details.map(( detail ) => ({
                ...detail,
                requestId   : request.id,
                isPriority  : !!detail.professorId && ( detail.days.length > 0 ) && !!detail.moduleId
            }));

            await this.requestDetail.createMany({ data: detailsData });

            return request;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create request' );
        }
    }


    async findAll( facultyId: string ) {
        return await this.request.findMany({
            where: {
                subject: {
                    facultyId
                }
            },
            include: {
                details: true,
            },
        });
    }


    async findOne( id: string ) {
        const request = await this.request.findUnique({
            where: { id },
            include: {
                details: true,
            },
        });

        if ( !request ) {
            throw new NotFoundException( 'Request not found' );
        }

        return request;
    }


    async update( id: string, updateRequestDto: UpdateRequestDto ) {
        try {
            return await this.request.update({
                where: { id },
                data: updateRequestDto
            });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to update request' );
        }
    }


    async remove( id: string ) {
        try {
            return await this.request.delete({ where: { id } });
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to delete request' );
        }
    }

}
