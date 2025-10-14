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

    async create( createPlanningChangeDto: CreatePlanningChangeDto ) {
        try {
            const { dayModulesId, ...data } = createPlanningChangeDto;

            const planningChange = await this.planningChange.create({
                data
            });

            await this.sessionDayModule.createMany({
                data: dayModulesId.map(( dayModuleId ) => ({
                    dayModuleId,
                    planningChangeId: planningChange.id
                })),
            });

            return planningChange;
        } catch ( error ) {
            throw PrismaException.catch( error, 'Failed to create planning change' );
        }
    }


    async findOne( id: string) {
        const planningChange = await this.planningChange.findUnique({
            where: { id }
        })

        if ( !planningChange ) {
            throw new NotFoundException( 'Planning change not found' );
        }

        return planningChange;
    }


    async findOneBySessionId( sessionId: string ) {
        const planningChange = await this.planningChange.findUnique({
            where: { sessionId }
        })

        if ( !planningChange ) {
            throw new NotFoundException( 'Planning change not found' );
        }

        return planningChange;
    }

    // async update( id: string, updatePlanningChangeDto: UpdatePlanningChangeDto ) {
    //     try {
    //         const { dayModulesId, ...data } = updatePlanningChangeDto;

    //         const planningChange = await this.planningChange.update({
    //             where : { id },
    //             data
    //         });


    //         const dayModulesByPlanningChange = await this.sessionDayModule.findMany({
	// 			where : { planningChangeId: id },
	// 		});

    //         const currentDayModuleIds   = dayModulesByPlanningChange.map(( dm ) => dm.dayModuleId ).sort();
	// 		const newDayModuleIds       = ( dayModulesId || [] ).sort();
	// 		const areEqual              = currentDayModuleIds.length === newDayModuleIds.length &&
	// 			currentDayModuleIds.every(( id, index ) => id === newDayModuleIds[index] );

    //         if ( !areEqual ) {
    //             await this.sessionDayModule.deleteMany({
    //                 where : { planningChangeId: id },
    //             });

    //             if ( newDayModuleIds.length > 0 ) {
    //                 await this.sessionDayModule.createMany({
    //                     data : newDayModuleIds.map(( dayModuleId ) => ({
    //                         dayModuleId,
    //                         planningChangeId: planningChange.id
    //                     })),
    //                 });
    //             }
    //         }

    //         return planningChange;
    //     } catch (error) {
	// 		throw PrismaException.catch( error, 'Failed to update request session' );
    //     }
    // }

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
