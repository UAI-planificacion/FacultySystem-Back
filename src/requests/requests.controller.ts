import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { RequestsService }  from '@requests/requests.service';
import { CreateRequestDto } from '@requests/dto/create-request.dto';
import { UpdateRequestDto } from '@requests/dto/update-request.dto';

@Controller( 'requests' )
export class RequestsController {

    constructor(
        private readonly requestsService: RequestsService
    ) {}


    @Post()
    create(
        @Body() createRequestDto: CreateRequestDto
    ) {
        return this.requestsService.create( createRequestDto );
    }


    @Get( '/faculty/:facultyId' )
    findAll(
        @Param( 'facultyId' ) facultyId: string
    ) {
        return this.requestsService.findAll( facultyId );
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.requestsService.findOne( id );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id: string,
        @Body() updateRequestDto: UpdateRequestDto
    ) {
        return this.requestsService.update( id, updateRequestDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.requestsService.remove( id );
    }

}
