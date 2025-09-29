import { Injectable, OnModuleInit } from '@nestjs/common';

import { ModuleDifference, Prisma, PrismaClient } from 'generated/prisma';

import { CreateModuleDto } from '@modules/dto/create-module.dto';
import { UpdateModuleDto } from '@modules/dto/update-module.dto';


@Injectable()
export class ModulesService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
		this.$connect();
	}


    #convertHourToMinutes( time: string ): number {
        const [hours, minutes] = time.split( ':' ).map( Number );
        return hours * 60 + minutes;
    }


    async #calculateAndSetOrderAndDifference(dayIds: number[]): Promise<void> {
        const moduleDifferencesToUpdate: Map<number, ModuleDifference | null> = new Map();
        const modulesInAffectedDays = await this.module.findMany({
            select  : { id: true },
            where   : {
                dayModules: {
                    some: {
                        dayId: { in: dayIds }
                    }
                }
            },
        });

        modulesInAffectedDays.forEach(mod => {
            moduleDifferencesToUpdate.set(mod.id, null);
        });


        for ( const dayId of dayIds ) {
            const dayModules = await this.dayModule.findMany({
                where   : { dayId: dayId },
                include : { module: true },
            });

            const sortedModules = dayModules.sort((a, b) => {
                const timeA = this.#convertHourToMinutes( a.module.startHour );
                const timeB = this.#convertHourToMinutes( b.module.startHour );

                if ( timeA !== timeB ) {
                    return timeA - timeB;
                }

                const endTimeA = this.#convertHourToMinutes( a.module.endHour );
                const endTimeB = this.#convertHourToMinutes( b.module.endHour );

                return endTimeA - endTimeB;
            });

            const dayModuleOrderUpdates: Prisma.PrismaPromise<any>[] = [];

            for ( let i = 0; i < sortedModules.length; i++ ) {
                const currentDayModule = sortedModules[i];

                dayModuleOrderUpdates.push(
                    this.dayModule.update({
                        where   : { id: currentDayModule.id },
                        data    : { order: i }
                    })
                );
            }

            for ( let i = 0; i < sortedModules.length; i++ ) {
                const currentModule             = sortedModules[i].module;
                const currentModuleEndMinutes   = this.#convertHourToMinutes( currentModule.endHour );

                if ( i + 1 < sortedModules.length ) {
                    const nextModule                = sortedModules[i + 1].module;
                    const nextModuleStartMinutes    = this.#convertHourToMinutes( nextModule.startHour );

                    if ( currentModuleEndMinutes > nextModuleStartMinutes ) {
                        moduleDifferencesToUpdate.set( currentModule.id, ModuleDifference.A );
                        moduleDifferencesToUpdate.set( nextModule.id, ModuleDifference.B );
                    }
                }
            }

            await this.$transaction( dayModuleOrderUpdates );
        }

        const moduleDifferenceUpdatePromises: Prisma.PrismaPromise<any>[] = [];

        moduleDifferencesToUpdate.forEach(( difference, moduleId ) => {
            moduleDifferenceUpdatePromises.push(
                this.module.update({
                    where   : { id: moduleId },
                    data    : { difference: difference }
                })
            );
        });

        if ( moduleDifferenceUpdatePromises.length > 0 ) {
            await this.$transaction( moduleDifferenceUpdatePromises );
        }
    }


    async createMany( createModuleDtos: CreateModuleDto[] ) {
        try {
            const allAffectedDayIds: Set<number> = new Set();

            await this.$transaction( async ( prisma ) => {
                for ( const createModuleDto of createModuleDtos ) {
                    const { days: dayIds, ...data }   = createModuleDto;
                    const module                = await prisma.module.create({ data: { ...data, difference: null } });

                    await prisma.dayModule.createMany({
                        data: dayIds.map( dayId => {
                            allAffectedDayIds.add( dayId );

                            return {
                                moduleId: module.id,
                                dayId,
                            };
                        }),
                    });
                }
            });

            if ( allAffectedDayIds.size > 0 ) {
                await this.#calculateAndSetOrderAndDifference( Array.from( allAffectedDayIds ));
            }

            return await this.findAllModules();
        } catch (error) {
            console.error( 'Error creating modules:', error );
            throw error;
        }
    }


    // async create( createModuleDto: CreateModuleDto ) {
    //     try {
    //         const { dayIds, ...data } = createModuleDto;
    //         const module = await this.module.create({ data });

    //         await this.dayModule.createMany({
    //             data: dayIds.map(dayId => ({
    //                 moduleId: module.id,
    //                 dayId,
    //             })),
    //         });

    //         await this.#calculateAndSetOrder( dayIds );

    //         return this.module.findUnique({
    //             where: { id: module.id },
    //             include: {
    //                 dayModules: {
    //                     orderBy: {
    //                         order: 'asc'
    //                     }
    //                 }
    //             },
    //         });
    //     } catch ( error ) {
    //         console.error( 'Error creating module:', error );
    //         throw error;
    //     }
    // }


    async #filterModules() {
        const modules = await this.module.findMany({
            select: {
                id          : true,
                startHour   : true,
                endHour     : true,
                difference  : true,
                code        : true,
                isActive    : true,
                dayModules  : {
                    select: {
                        dayId   : true,
                        id      : true,
                        order   : true
                    },
                    orderBy: {
                        dayId: 'asc',
                    }
                }
            }
        });

        return modules.flatMap( module => {
            const { dayModules, ...rest } = module;

            return dayModules.map( dayModule => ({
                ...rest,
                id          : `${rest.id}${rest.difference? `-${rest.difference}` : ''}`,
                name        : `M${rest.code}:${dayModule.dayId}${rest.difference? `-${rest.difference}` : ''}`,
                dayId       : dayModule.dayId,
                dayModuleId : dayModule.id,
                order       : dayModule.order
            }));
        });
    }


    async findAllModules() {
        const modules = await this.module.findMany({
            select: {
                id          : true,
                code        : true,
                difference  : true,
                startHour   : true,
                endHour     : true,
                isActive    : true,
                createdAt   : true,
                updatedAt   : true,
                dayModules  : {
                    select: {
                        dayId: true
                    }
                }
            }
        });

        return modules.map( module => ({
            id          : module.id,
            code        : module.code,
            difference  : module.difference,
            startHour   : module.startHour,
            endHour     : module.endHour,
            isActive    : module.isActive,
            createdAt   : module.createdAt,
            updatedAt   : module.updatedAt,
            name        : `M${module.code}`,
            days        : module.dayModules.map( dayModule => dayModule.dayId ),
        })).sort(( a, b ) => Number( a.code ) - Number( b.code ));
    }


    async findAll() {
        return await this.#filterModules();
    }


    async findAllDayModules() {
        return await this.dayModule.findMany( {} );
    }


    async findOne( id: number ) {
        return await this.module.findUnique({ where: { id }})
    }


    async update( id: number, updateModuleDto: UpdateModuleDto ) {
        try {
            const { days: dayIds, ...data } = updateModuleDto;

            const existingModule = await this.module.findUnique({
                where   : { id },
                include : { dayModules: true }
            });

            if ( !existingModule ) {
                throw new Error( `Module with ID ${id} not found.` );
            }

            const affectedDayIds: Set<number> = new Set();

            existingModule.dayModules.map( dm => dm.dayId ).forEach( dayId => affectedDayIds.add( dayId ));

            await this.module.update({
                where: { id },
                data,
            });

            if ( dayIds ) {
                await this.dayModule.deleteMany({
                    where: { moduleId: id },
                });

                await this.dayModule.createMany({
                    data: dayIds.map(dayId => ({
                        moduleId: id,
                        dayId,
                    })),
                });

                dayIds.forEach( dayId => affectedDayIds.add( dayId ));
            }

            if ( affectedDayIds.size > 0 ) {
                await this.#calculateAndSetOrderAndDifference( Array.from( affectedDayIds ));
            }

            return await this.findAllModules();
        } catch ( error ) {
            console.error( 'Error updating module:', error );
            throw error;
        }
    }


    async remove( id: number ) {
        try {
            const existingDayModules = await this.dayModule.findMany({
                where   : { moduleId: id },
                select  : { dayId: true }
            });

            const affectedDayIds = existingDayModules.map( dm => dm.dayId );

            await this.module.delete({
                where: { id },
            });

            if ( affectedDayIds.length > 0 ) {
                await this.#calculateAndSetOrderAndDifference( affectedDayIds );
            }

            return await this.findAllModules();
        } catch (error) {
            console.error('Error deleting module:', error);
            throw error;
        }
    }

}
