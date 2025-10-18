import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { PlanningChangeService }    from '@planning-change/planning-change.service';
import { CreatePlanningChangeDto }  from '@planning-change/dto/create-planning-change.dto';
import { UpdatePlanningChangeDto }  from '@planning-change/dto/update-planning-change.dto';


@Controller( 'planning-change' )
export class PlanningChangeController {

    constructor(
        private readonly planningChangeService: PlanningChangeService
    ) {}


    @Post()
    create(
        @Body() createPlanningChangeDto: CreatePlanningChangeDto
    ) {
        return this.planningChangeService.create( createPlanningChangeDto );
    }


    @Get( '/session/:id' )
    findOneBySessionId(
        @Param( 'id' ) id: string
    ) {
        return this.planningChangeService.findOneBySessionId( id );
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.planningChangeService.findOne( id );
    }


    @Get( '/without/session' )
    findSessionWhitouthPlanningChangeId() {
        return this.planningChangeService.findSessionWhitouthPlanningChangeId();
    }

    // @Patch( ':id' )
    // update(
    //     @Param( 'id' ) id: string,
    //     @Body() updatePlanningChangeDto: UpdatePlanningChangeDto
    // ) {
    //     return this.planningChangeService.update( id, updatePlanningChangeDto );
    // }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.planningChangeService.remove( id );
    }

}
