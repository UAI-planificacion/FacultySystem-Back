import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { ModuleDifference, Prisma, PrismaClient } from 'generated/prisma';

import { PrismaException } from '@config/prisma-catch';
import { CreateModuleDto } from '@modules/dto/create-module.dto';
import { UpdateModuleDto } from '@modules/dto/update-module.dto';


@Injectable()
export class ModulesService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
		this.$connect();
	}


    async #calculateAndSetOrderAndDifference( dayIds: number[] ): Promise<void> {
        await this.$transaction( async ( prisma ) => {
            for ( const dayId of dayIds ) {
                await this.#processSingleDay( dayId, prisma );
            }
        });
    }


    async #processSingleDay(
        dayId   : number,
        prisma  : Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
    ): Promise<void> {
        const dayModules = await prisma.dayModule.findMany({
            where: { dayId },
            include: {
                module: true,
            },
            orderBy: {
                module: {
                    startHour: 'asc',
                },
            },
        });

        if ( dayModules.length === 0 ) {
            return;
        }

        const updatePromises: Prisma.PrismaPromise<any>[] = [];

        // 1. Actualizar el 'order' en DayModule (esto no cambia, sigue siendo correcto).
        dayModules.forEach(( dayModule, index ) => {
            if ( dayModule.order !== index ) {
                updatePromises.push(
                    prisma.dayModule.update({
                        where   : { id: dayModule.id },
                        data    : { order: index },
                    })
                );
            }
        });

        // 2. Agrupar módulos por solapamiento (esto no cambia, el algoritmo es el mismo).
        const conflictGroups: (typeof dayModules)[] = [];

        if ( dayModules.length > 0 ) {
            let currentGroup        = [dayModules[0]];
            let maxEndTimeInGroup   = dayModules[0].module.endHour;

            for ( let i = 1; i < dayModules.length; i++ ) {
                const currentDayModule  = dayModules[i];
                const currentModule     = currentDayModule.module;

                if ( currentModule.startHour < maxEndTimeInGroup ) {
                    currentGroup.push(currentDayModule);
                    if ( currentModule.endHour > maxEndTimeInGroup ) {
                        maxEndTimeInGroup = currentModule.endHour;
                    }
                } else {
                    conflictGroups.push( currentGroup );
                    currentGroup = [currentDayModule];
                    maxEndTimeInGroup = currentModule.endHour;
                }
            }

            conflictGroups.push( currentGroup );
        }  

        const allModuleIdsToReset = new Set( dayModules.map( dm => dm.moduleId ));

        conflictGroups.forEach((group, groupIndex) => {
            const groupNumber = groupIndex + 1; // El grupo ahora es 1, 2, 3...

            // Si el grupo tiene más de un módulo, es un conflicto y lleva letra
            if (group.length > 1) {
                group.forEach(( dayModule, itemIndex ) => {
                    const differenceLetter  = String.fromCharCode( 65 + itemIndex ); // A, B, C..
                    const newCode           = `${groupNumber}${differenceLetter}`; // "1A", "1B", etc

                    // Actualizamos tanto 'code' como 'difference' en el Module.
                    updatePromises.push(
                        prisma.module.update({
                            where: { id: dayModule.moduleId },
                            data: {
                                code: newCode,
                                difference: differenceLetter as ModuleDifference,
                            },
                        })
                    );

                    allModuleIdsToReset.delete( dayModule.moduleId );
                });
            } else {
                // Si el grupo tiene un solo módulo, no hay conflicto.
                const dayModule = group[0];
                const newCode   = `${groupNumber}`; // El código es solo el número del grupo.

                // Actualizamos 'code' y ponemos 'difference' a null.
                updatePromises.push(
                    prisma.module.update({
                        where: { id: dayModule.moduleId },
                        data: {
                            code: newCode,
                            difference: null,
                        },
                    })
                );
                allModuleIdsToReset.delete(dayModule.moduleId);
            }
        });

        // 4. Ejecutar todas las actualizaciones.
        if ( updatePromises.length > 0 ) {
            await Promise.all( updatePromises );
        }
    }


    async createMany( createModuleDtos: CreateModuleDto[] ) {
        try {
            const existModule = await this.module.findMany({
                where: {
                    startHour: {
                        in: createModuleDtos.map( createModuleDto => createModuleDto.startHour ),
                    }
                },
            });

            if ( existModule.length > 0 ) {
                throw new BadRequestException( `Existenten módulos con la misma hora de inicio: ${ existModule.map( module => module.startHour ).join( ', ' )}` );
            }

            const allAffectedDayIds: Set<number> = new Set();

            await this.$transaction( async ( prisma ) => {
                for ( const createModuleDto of createModuleDtos ) {
                    const { dayIds, ...data }   = createModuleDto;
                    const module                = await prisma.module.create({ data: { ...data, difference: null }});

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
            throw PrismaException.catch( error, 'Error creating modules' );
        }
    }


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
            },
            orderBy: {
                startHour: 'asc',
            },
        });

        return modules.map( module => ({
            // id          : module.id,
            // code        : module.code,
            // difference  : module.difference,
            // startHour   : module.startHour,
            // endHour     : module.endHour,
            // isActive    : module.isActive,
            // createdAt   : module.createdAt,
            // updatedAt   : module.updatedAt,
            // name        : `M${module.code}`,
            // days        : module.dayModules.map( dayModule => dayModule.dayId ),
            ...module,
            name        : `M${module.code}`,
            days        : module.dayModules.map( dayModule => dayModule.dayId ),
        }));
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
            const existModule = await this.module.findMany({
                where: {
                    AND: [
                        { id: { not: id } },
                        { startHour: updateModuleDto.startHour },
                    ],
                },
            });

            if ( existModule.length > 0 ) {
                throw new BadRequestException( `Existenten módulos con la misma hora de inicio: ${ existModule.map( module => module.startHour ).join( ', ' )}` );
            }

            const { dayIds: dayIds, ...data } = updateModuleDto;

            const existingModule = await this.module.findUnique({
                where   : { id },
                include : { dayModules: true }
            });

            if ( !existingModule ) {
                throw new BadRequestException( `Module with ID ${id} not found.` );
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
            throw PrismaException.catch( error, 'Error updating module' );
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
            throw PrismaException.catch( error, 'Error deleting module' );
        }
    }

}
