import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { RequestSessionsService }   from '@request-sessions/request-sessions.service';
import { CreateRequestSessionDto }  from '@request-sessions/dto/create-request-session.dto';
import { UpdateRequestSessionDto }  from '@request-sessions/dto/update-request-session.dto';


@Controller( 'request-sessions' )
export class RequestSessionsController {

    constructor(
        private readonly requestSessionsService: RequestSessionsService
    ) {}


    @Post( ':requestId' )
    create(
        @Body() createRequestSessionDto: CreateRequestSessionDto,
        @Param( 'requestId' ) requestId: string
    ) {
        return this.requestSessionsService.create( requestId, createRequestSessionDto );
    }


    @Get( '/request/:id' )
    findAllByRequestId(
        @Param( 'id' ) requestId: string
    ) {
        return this.requestSessionsService.findAllByRequestId( requestId );
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.requestSessionsService.findOne( id );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id: string,
        @Body() updateRequestSessionDto: UpdateRequestSessionDto
    ) {
        return this.requestSessionsService.update( id, updateRequestSessionDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.requestSessionsService.remove( id );
    }

}
