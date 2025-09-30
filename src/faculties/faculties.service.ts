import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { PrismaException }          from '@app/config/prisma-catch';
import { CreateFacultyDto }         from '@faculties/dto/create-faculty.dto';
import { UpdateFacultyDto }         from '@faculties/dto/update-faculty.dto';
import { Faculty, FacultyResponse } from '@faculties/entities/faculty.entity';


@Injectable()
export class FacultiesService extends PrismaClient implements OnModuleInit {
    onModuleInit() {
        this.$connect();
    }

    async create( createFacultyDto: CreateFacultyDto ) {
        try {
            return await this.faculty.create({ data: createFacultyDto });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to create faculty' );
        }
    }


    #selectFactulty = {
        id          : true,
        name        : true,
        description : true,
        isActive    : true,
        createdAt   : true,
        updatedAt   : true,
        _count      : {
            select: {
                staff       : true,
                subjects    : true,
            },
        },
        // subjects: {
        //     select: {
        //         _count: {
        //             select: {
        //                 offers: true
        //             }
        //         }
        //     },
        // },
    }


    #getSubTotals = async ( faculty: any ) => {
        // const facultyTotalOffers = await this.offer.count({
        //     where: {
        //         subject: {
        //             facultyId: faculty.id
        //         }
        //     }
        // });

        const facultyTotalRequests = await this.request.count({
            // TODO:: Hay que cambiarlo por las secciones
            // where: {
            //     offer: {
            //         subject: {
            //             facultyId: faculty.id
            //         }
            //     }
            // }
        });

        return {
            id              : faculty.id,
            name            : faculty.name,
            description     : faculty.description || undefined,
            totalSubjects   : faculty._count.subjects,
            totalStaff      : faculty._count.staff,
            totalRequests   : facultyTotalRequests,
            // totalOffers     : facultyTotalOffers,
            isActive        : faculty.isActive,
            createdAt       : faculty.createdAt,
            updatedAt       : faculty.updatedAt,
        };
    }


    async findAll() : Promise<FacultyResponse> {
        const totalSubjects     = await this.subject.count();
        const totalStaff        = await this.staff.count();
        const totalRequests     = await this.request.count();
        // const totalOffers       = await this.offer.count();
        const facultiesCounts   = await this.faculty.findMany({
            select : this.#selectFactulty,
        });

        const faculties: Faculty[] = await Promise.all(
            facultiesCounts.map( faculty => this.#getSubTotals( faculty ))
        );

        return {
            totalSubjects,
            totalStaff,
            totalRequests,
            // totalOffers,
            faculties,
        };
    }


    async findOne( id: string ) {
        const faculty = await this.faculty.findUnique({
            where: { id },
            select: this.#selectFactulty
        });

        if ( !faculty ) {
            throw new NotFoundException( 'Faculty not found' );
        }

        return this.#getSubTotals( faculty );
    }


    async update( id: string, updateFacultyDto: UpdateFacultyDto ) {
        try {
            return await this.faculty.update({ where: { id }, data: updateFacultyDto });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to update faculty' );
        }
    }


    async remove( id: string ) {
        try {
            return await this.faculty.delete({ where: { id } });
        } catch (error) {
            throw PrismaException.catch( error, 'Failed to delete faculty' );
        }
    }

}
