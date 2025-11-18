import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';

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
