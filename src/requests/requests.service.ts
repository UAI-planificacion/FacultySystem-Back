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
        try {
            const request = await this.request.create({ data: createRequestDto });
            return request;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create request' );
        }
    }


    async findAll( facultyId: string ) {
        const requests = await this.request.findMany({
            select : {
                id              : true,
                title           : true,
                status          : true,
                isConsecutive   : true,
                description     : true,
                comment         : true,
                createdAt       : true,
                updatedAt       : true,
                staffCreate     : {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                staffUpdate     : {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                subject         : {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                _count: {
                    select: {
                        details: true
                    }
                }
            },
            where: {
                subject: {
                    facultyId
                }
            }
        });

        return requests.map(( request ) => ({
            id              : request.id,
            title           : request.title,
            status          : request.status,
            isConsecutive   : request.isConsecutive,
            description     : request.description,
            comment         : request.comment,
            createdAt       : request.createdAt,
            updatedAt       : request.updatedAt,
            staffCreate     : request.staffCreate,
            staffUpdate     : request.staffUpdate,
            subject         : request.subject,
            totalDetails    : request._count.details
        }));
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
