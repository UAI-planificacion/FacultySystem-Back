import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }  from '@app/config/prisma-catch';
import { CreateStaffDto }   from '@staff/dto/create-staff.dto';
import { UpdateStaffDto }   from '@staff/dto/update-staff.dto';


@Injectable()
export class StaffService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }

    async create( createStaffDto: CreateStaffDto ) {
        try {
            return await this.staff.create({ data: createStaffDto });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to create staff' );
        }
    }


    async findAll( facultyId: string ) {
        return await this.staff.findMany({
            where: {
                facultyId
            }
        });
    }


    async findOne( id: string ) {
        const staff = await this.staff.findFirst({
            select : {
                id          : true,
                name        : true,
                email       : true,
                role        : true,
                isActive    : true,
                createdAt   : true,
                updatedAt   : true,
                faculty     : {
                    select: {
                        id      : true,
                        name    : true,
                    }
                },
            },
            where: {
                OR: [
                    { id },
                    { email: id },
                ],
            },
        });

        if ( !staff ) {
            throw new NotFoundException( 'Staff not found' );
        }

        return {
            id          : staff.id,
            name        : staff.name,
            email       : staff.email,
            role        : staff.role,
            isActive    : staff.isActive,
            createdAt   : staff.createdAt,
            updatedAt   : staff.updatedAt,
            facultyId   : staff.faculty.id,
            facultyName : staff.faculty.name,
        }
    }


    async update( id: string, updateStaffDto: UpdateStaffDto ) {
        try {
            return await this.staff.update({
                where: { id },
                data: {
                    name    : updateStaffDto.name,
                    email   : updateStaffDto.email,
                    role    : updateStaffDto.role,
                    isActive: updateStaffDto.isActive
                }
            });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to update staff' );
        }
    }


    async remove( id: string ) {
        try {
            return await this.staff.delete({ where: { id } });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to delete staff' );
        }
    }

}
