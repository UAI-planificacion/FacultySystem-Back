import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'generated/prisma';

import { CreatePlanningChangeDto }  from '@planning-change/dto/create-planning-change.dto';
import { UpdatePlanningChangeDto }  from '@planning-change/dto/update-planning-change.dto';
import { PrismaException }          from '@config/prisma-catch';

@Injectable()
export class PlanningChangeService extends PrismaClient implements OnModuleInit {

    onModuleInit() {
        this.$connect();
    }


    #selectPlanningChange = {
        id              : true,
        title           : true,
        status          : true,
        sessionName     : true,
        building        : true,
        spaceId         : true,
        isEnglish       : true,
        isConsecutive   : true,
        description     : true,
        spaceType       : true,
        inAfternoon     : true,
        isPriority      : true,
        professor       : { 
            select : {
                name : true,
                id : true
            }
        },
        spaceSize     : {
            select : {
                id : true,
                detail : true,
            }
        },
        sessionId : true,
        sectionId: true,
        // session       : {
        //     select : {
        //         id          : true,
        //         name        : true,
        //         spaceId     : true,
        //         date        : true,
        //         isEnglish   : true,
        //         professor   : {
        //             select: {
        //                 id      : true,
        //                 name    : true
        //             }
        //         },
        //         dayModule : {
        //             select : {
        //                 id      : true,
        //                 dayId   : true,
        //                 module  : {
        //                     select : {
        //                         id          : true,
        //                         startHour   : true,
        //                         endHour     : true,
        //                         difference  : true,
        //                         code        : true,
        //                     }
        //                 }
        //             }
        //         },
        //     }
        // },
        // section       : {
        //     select: {
        //         id          : true,
        //         code        : true,
        //         isClosed    : true,
        //         groupId     : true,
        //         startDate   : true,
        //         endDate     : true,
        //         spaceType   : true,
        //         spaceSizeId : true,
        //         professor   : {
        //             select: {
        //                 id      : true,
        //                 name    : true
        //             }
        //         },
        //         spaceSize: {
        //             select: {
        //                 id      : true,
        //                 detail  : true,
        //             }
        //         },
        //         subject: {
        //             select: {
        //                 id      : true,
        //                 name    : true,
        //             }
        //         },
        //         period : {
        //             select : {
        //                 id      : true,
        //                 name    : true,
        //             }
        //         },
        //         workshop        : true,
        //         lecture         : true,
        //         tutoringSession : true,
        //         laboratory      : true,
        //     }
        // },
        createdAt       : true,
        updatedAt       : true,
        staffCreate       : {
            select: {
                id      : true,
                name    : true,
            }
        },
        staffUpdate: {
            select: {
                id      : true,
                name    : true,
            }
        },
        sessionDayModules: {
            select: {
                dayModuleId: true,
                // dayModule: {
                //     select: {
                //         id          : true,
                //         dayId       : true,
                //         module      : {
                //             select: {
                //                 id          : true,
                //                 startHour   : true,
                //                 endHour     : true,
                //                 difference  : true,
                //                 code        : true,
                //             }
                //         }
                //     }
                // }
            }
        }
    }


    #planingChangeMap = ( planningChange: any ) => ({
        ...planningChange,
        dayModulesId: planningChange.sessionDayModules?.map(( dm ) => dm.dayModuleId ) ?? [],
    })


    async create( createPlanningChangeDto: CreatePlanningChangeDto ) {
        try {
            const { dayModulesId, ...data } = createPlanningChangeDto;

            const cleanData = Object.fromEntries(
                Object.entries( data ).filter(( [ _, value ] ) => value !== null )
            ) as typeof data;

            const planningChangeCreated = await this.planningChange.create({
                select  : { id : true },
                data    : cleanData
            });

            if ( dayModulesId.length > 0 ) {
                await this.sessionDayModule.createMany({
                    data: dayModulesId.map(( dayModuleId ) => ({
                        dayModuleId,
                        planningChangeId: planningChangeCreated.id
                    })),
                });
            }

            return await this.findOne( planningChangeCreated.id );
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create planning change' );
        }
    }


    async findOne( id: string) {
        const planningChange = await this.planningChange.findUnique({
            where: { id },
            select: this.#selectPlanningChange
        })

        if ( !planningChange ) {
            throw new NotFoundException( `Planning change not found with id: ${id}` );
        }

        return this.#planingChangeMap ( planningChange );
    }


    // async findOneBySessionId( sessionId: string ) {
    //     const planningChange = await this.planningChange.findUnique({
    //         where: { sessionId }
    //     })

    //     if ( !planningChange ) {
    //         throw new NotFoundException( 'Planning change not found' );
    //     }

    //     return planningChange;
    // }


    // async findSessionWhitouthPlanningChangeId() {
    //     const planningChange = await this.session.findMany({
    //         where: { planningChange: null },
    //         select: {
    //             id: true,
    //             name: true,
    //             date: true,
    //             professor: {
    //                 select: {
    //                     id: true,
    //                     name: true,
    //                 }
    //             },
    //             dayModule: {
    //                 select: {
    //                     id: true,
    //                     dayId: true,
    //                     module : {
    //                         select: {
    //                             id: true,
    //                             startHour: true,
    //                             endHour: true,
    //                             difference: true,
    //                             code: true,
    //                         }
    //                     }
    //                 }
    //             },
    //             spaceId: true,
    //             isEnglish: true,
    //             section: {
    //                 select: {
    //                     id: true,
    //                     code: true,
    //                     startDate: true,
    //                     endDate: true,
    //                     subject: {
    //                         select: {
    //                             id: true,
    //                             name: true,
    //                         }
    //                     }
    //                 }
    //             },
    //         }
    //     });

    //     return planningChange;
    // }


    async update( id: string, updatePlanningChangeDto: UpdatePlanningChangeDto ) {
        try {
            const { dayModulesId, ...data } = updatePlanningChangeDto;

            const planningChange = await this.planningChange.update({
                where   : { id },
                select  : { id : true },
                data
            });

            const dayModulesByPlanningChange = await this.sessionDayModule.findMany({
				where : { planningChangeId: id },
			});

            const currentDayModuleIds   = dayModulesByPlanningChange.map(( dm ) => dm.dayModuleId ).sort();
			const newDayModuleIds       = ( dayModulesId || [] ).sort();
			const areEqual              = currentDayModuleIds.length === newDayModuleIds.length &&
				currentDayModuleIds.every(( id, index ) => id === newDayModuleIds[index] );

            if ( !areEqual ) {
                await this.sessionDayModule.deleteMany({
                    where : { planningChangeId: id },
                });

                if ( newDayModuleIds.length > 0 ) {
                    await this.sessionDayModule.createMany({
                        data : newDayModuleIds.map(( dayModuleId ) => ({
                            dayModuleId,
                            planningChangeId: planningChange.id
                        })),
                    });
                }
            }

            // return planningChange;
            return this.findOne( planningChange.id );
        } catch (error) {
			throw PrismaException.catch( error, 'Failed to update request session' );
        }
    }

    async remove(id: string) {
        try {
            const planningChange = await this.planningChange.delete({
                where : { id },
            });

            return planningChange;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to remove planning change' );
        }
    }
}
