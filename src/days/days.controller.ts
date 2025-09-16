import { Controller, Get, Body, Patch, Param, Post } from '@nestjs/common';

import { DaysService }  from '@days/days.service';
import { UpdateDayDto } from '@days/dto/update-day.dto';
import { CreateDayDto } from './dto/create-day.dto';


@Controller( 'days' )
export class DaysController {
    constructor( private readonly daysService: DaysService ) {}

    @Post()
    create(
        @Body() createDayDto: CreateDayDto
    ) {
        return this.daysService.create( createDayDto );
    }


    @Get()
    findAll() {
        return this.daysService.findAll();
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.daysService.findOne( +id );
    }

    @Patch( ':id' )
    update(
        @Param( 'id' ) id: string,
        @Body() updateDayDto: UpdateDayDto
    ) {
        return this.daysService.update( +id, updateDayDto );
    }

}
