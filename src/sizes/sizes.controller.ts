import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { $Enums } from 'generated/prisma';

import { SizesService }     from '@sizes/sizes.service';
import { CreateSizeDto }    from '@sizes/dto/create-size.dto';
import { UpdateSizeDto }    from '@sizes/dto/update-size.dto';


@Controller( 'sizes' )
export class SizesController {

    constructor(
        private readonly sizesService: SizesService
    ) {}


    @Post()
    create(
        @Body() createSizeDto: CreateSizeDto
    ) {
        return this.sizesService.create( createSizeDto );
    }


    @Get()
    findAll() {
        return this.sizesService.findAll();
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: $Enums.SizeValue
    ) {
        return this.sizesService.findOne(id );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id       : $Enums.SizeValue,
        @Body() updateSizeDto   : UpdateSizeDto
    ) {
        return this.sizesService.update( id, updateSizeDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: $Enums.SizeValue
    ) {
        return this.sizesService.remove( id );
    }

}
