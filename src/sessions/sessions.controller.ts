import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { SessionsService }          from '@sessions/sessions.service';
import { CreateSessionDto }         from '@sessions/dto/create-session.dto';
import { UpdateSessionDto }         from '@sessions/dto/update-session.dto';
import { CreateMassiveSessionDto }  from '@sessions/dto/create-massive-session.dto';


@Controller( 'sessions' )
export class SessionsController {

    constructor(
        private readonly sessionsService: SessionsService
    ) {}


    @Post()
    create(
        @Body() createSessionDto: CreateSessionDto
    ) {
        return this.sessionsService.create( createSessionDto );
    }


    @Post( 'massive/:sectionId' )
    createMassive(
        @Param( 'sectionId' ) sectionId: string,
        @Body() createMassiveSessionDto: CreateMassiveSessionDto[]
    ) {
        return this.sessionsService.createMassive( sectionId, createMassiveSessionDto );
    }


    @Get()
    findAll() {
        return this.sessionsService.findAll();
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.sessionsService.findOne( id );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id: string,
        @Body() updateSessionDto: UpdateSessionDto
    ) {
        return this.sessionsService.update( id, updateSessionDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.sessionsService.remove( id );
    }

}
