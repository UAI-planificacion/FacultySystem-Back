import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ModulesService }   from '@modules/modules.service';
import { CreateModuleDto }  from '@modules/dto/create-module.dto';
import { UpdateModuleDto }  from '@modules/dto/update-module.dto';
import { CREATE_MODULE_DOC } from './docs/create.doc';


@Controller( 'modules' )
export class ModulesController {
    constructor(
        private readonly modulesService: ModulesService
    ) {}


    @Post()
    @ApiOperation( CREATE_MODULE_DOC.SUMMARY )
    @ApiResponse( CREATE_MODULE_DOC.RESPONSE_200 )
    @ApiResponse( CREATE_MODULE_DOC.RESPONSE_400 )
    @ApiBody( CREATE_MODULE_DOC.API_BODY )
    createMany(
        @Body() createModuleDto: CreateModuleDto[]
    ) {
        return this.modulesService.createMany(createModuleDto);
    }

    @Get( 'original' )
    findAllModules() {
        return this.modulesService.findAllModules();
    }


    @Get()
    findAll() {
        return this.modulesService.findAll();
    }


    @Get( '/dayModule' )
    findAllDayModules() {
        return this.modulesService.findAllDayModules();
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.modulesService.findOne( +id );
    }


    @Patch( ':id' )
    update(
        @Param('id') id: string,
        @Body() updateModuleDto: UpdateModuleDto
    ) {
        return this.modulesService.update( +id, updateModuleDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.modulesService.remove( +id );
    }

}
