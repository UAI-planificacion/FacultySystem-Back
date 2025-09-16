import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { PeriodsService }   from '@periods/periods.service';
import { CreatePeriodDto }  from '@periods/dto/create-period.dto';
import { UpdatePeriodDto }  from '@periods/dto/update-period.dto';


@Controller( 'periods' )
export class PeriodsController {
    constructor(private readonly periodsService: PeriodsService) {}


    @Post()
    create(
        @Body() createPeriodDto: CreatePeriodDto
    ) {
        return this.periodsService.create( createPeriodDto );
    }


    @Get()
    findAll() {
        return this.periodsService.findAll();
    }


    @Get( ':id' )
    findOne(
        @Param('id') id: string
    ) {
        return this.periodsService.findOne( id );
    }


    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updatePeriodDto: UpdatePeriodDto
    ) {
        return this.periodsService.update( id, updatePeriodDto );
    }


    @Delete( ':id' )
    remove(
        @Param('id') id: string
    ) {
        return this.periodsService.remove( id );
    }

}
