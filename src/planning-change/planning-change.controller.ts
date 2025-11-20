import { Request } from 'express';

import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';

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
        @Body() createPlanningChangeDto : CreatePlanningChangeDto,
		@Req() request                  : Request,
    ) {
		const origin = request.headers['origin'];
        return this.planningChangeService.create( createPlanningChangeDto, origin );
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string,
    ) {
        return this.planningChangeService.findOne( id );
    }


    @Get()
    findAll() {
        return this.planningChangeService.findAll();
    }


    @Get( '/faculty/:id' )
    findByFacultyId(
        @Param( 'id' ) id: string
    ) {
        return this.planningChangeService.findByFacultyId( id );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id               : string,
        @Body() updatePlanningChangeDto : UpdatePlanningChangeDto,
		@Req() request                  : Request,
    ) {
		const origin = request.headers['origin'];
        return this.planningChangeService.update( id, updatePlanningChangeDto, origin );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id   : string,
		@Req() request      : Request,
    ) {
		const origin = request.headers['origin'];
        return this.planningChangeService.remove( id, origin );
    }

}
