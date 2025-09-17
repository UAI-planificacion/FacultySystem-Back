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

    async findAll() : Promise<FacultyResponse> {
        const totalSubjects     = await this.subject.count();
        const totalPersonnel    = await this.staff.count();
        const totalRequests     = await this.request.count();
        const totalOffers       = await this.offer.count();
        const facultiesCounts   = await this.faculty.findMany({
            select: {
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
                subjects: {
                    select: {
                        _count: 
                            true
                    },
                },
            },
        });

        const faculties: Faculty[] = facultiesCounts.map( faculty => {
            const totalRequests = faculty.subjects.reduce(( sum, subject ) => {
                // return sum + subject._count.requests;
                return sum + subject._count.offers;
            }, 0);

            return {
                id              : faculty.id,
                name            : faculty.name,
                description     : faculty.description || undefined,
                totalSubjects   : faculty._count.subjects,
                totalPersonnel  : faculty._count.staff,
                totalRequests,
                totalOffers,
                isActive        : faculty.isActive,
                createdAt       : faculty.createdAt,
                updatedAt       : faculty.updatedAt,
            };
        });

        return {
            totalSubjects,
            totalPersonnel,
            totalRequests,
            totalOffers,
            faculties,
        };
    }


    async findOne( id: string ) {
        const faculty = await this.faculty.findUnique({ where: { id } });

        if ( !faculty ) {
            throw new NotFoundException( 'Faculty not found' );
        }

        return faculty;
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
