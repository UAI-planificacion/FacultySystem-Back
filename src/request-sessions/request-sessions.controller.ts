import { Request } from 'express';

import { Controller, Get, Body, Patch, Param, Delete, Req } from '@nestjs/common';

import { RequestSessionsService }       from '@request-sessions/request-sessions.service';
import { UpdateRequestSessionDto }      from '@request-sessions/dto/update-request-session.dto';
import { UpdateSessionDayModulesDto }   from '@request-sessions/dto/update-session-day-modules.dto';


@Controller( 'request-sessions' )
export class RequestSessionsController {

    constructor(
        private readonly requestSessionsService: RequestSessionsService
    ) {}


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


    @Patch( '/day-modules' )
    updateSessionDayModules(
        @Body() updateSessionDayModulesDto: UpdateSessionDayModulesDto[]
    ) {
        return this.requestSessionsService.updateSessionDayModules( updateSessionDayModulesDto );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id: string,
        @Body() updateRequestSessionDto: UpdateRequestSessionDto,
		@Req() request: Request,
    ) {
		const origin = request.headers['origin'];
        return this.requestSessionsService.update( id, updateRequestSessionDto, origin );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string,
		@Req() request: Request,
    ) {
		const origin = request.headers['origin'];
        return this.requestSessionsService.remove( id, origin );
    }

}
