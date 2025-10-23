import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { SessionsService }          from '@sessions/sessions.service';
import { CreateSessionDto }         from '@sessions/dto/create-session.dto';
import { UpdateSessionDto }         from '@sessions/dto/update-session.dto';
import { CreateMassiveSessionDto }  from '@sessions/dto/create-massive-session.dto';
import { MassiveUpdateSessionDto }  from '@sessions/dto/massive-update-session.dto';
import { CalculateAvailabilityDto } from '@sessions/dto/calculate-availability.dto';
import { AvailableSessionDto }      from '@sessions/dto/available-session.dto';


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

    @Get( 'section/:sectionId' )
    findBySectionId(
        @Param( 'sectionId' ) sectionId: string
    ) {
        return this.sessionsService.findBySectionId( sectionId );
    }


    @Post( 'calculate-availability/:sectionId' )
    calculateAvailability(
        @Param( 'sectionId' ) sectionId: string,
        @Body() calculateAvailabilityDto: CalculateAvailabilityDto[]
    ) {
        return this.sessionsService.calculateSessionAvailability( sectionId, calculateAvailabilityDto );
    }


    @Post( 'availables' )
    findAvailableSessions(
        @Body() availableSessionDto: AvailableSessionDto
    ) {
        return this.sessionsService.findAvailableSessions( availableSessionDto );
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


    @Patch( 'update/massive' )
    massiveUpdate(
        @Body() updateSessionDto: MassiveUpdateSessionDto
    ) {
        return this.sessionsService.massiveUpdate( updateSessionDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.sessionsService.remove( id );
    }

    @Delete( 'massive/:ids' )
    massiveRemove(
        @Param( 'ids' ) ids: string
    ) {
        return this.sessionsService.massiveRemove( ids.split( ',' ) );
    }

}
