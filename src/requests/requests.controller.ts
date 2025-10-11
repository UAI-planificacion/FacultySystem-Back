import { Request } from 'express';

import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiBody }                                         from '@nestjs/swagger';

import { RequestsService }  from '@requests/requests.service';
import { CreateRequestDto } from '@requests/dto/create-request.dto';
import { UpdateRequestDto } from '@requests/dto/update-request.dto';

@ApiTags( 'Requests' )
@Controller( 'requests' )
export class RequestsController {

	constructor(
		private readonly requestsService: RequestsService
	) {}


	@Post()
	@ApiBody({ type: CreateRequestDto })
	create(
		@Body() createRequestDto    : CreateRequestDto,
		@Req() request              : Request,
	) {
		const origin = request.headers['origin'];
		return this.requestsService.create( createRequestDto, origin );
	}


	@Get( '/faculty/:facultyId' )
	findAll(
		@Param( 'facultyId' ) facultyId: string
	) {
		return this.requestsService.findAll( facultyId );
	}


    @Get( '/section/:sectionId' )
	findBySectionId(
		@Param( 'sectionId' ) sectionId: string
	) {
		return this.requestsService.findBySectionId( sectionId );
	}


	@Get( ':id' )
	findOne(
		@Param( 'id' ) id: string
	) {
		return this.requestsService.findOne( id );
	}


	@Patch( ':id' )
	update(
		@Param( 'id' ) id           : string,
		@Body() updateRequestDto    : UpdateRequestDto,
		@Req() request              : Request,
	) {
		const origin = request.headers['origin'];
		return this.requestsService.update( id, updateRequestDto, origin );
	}


	@Delete( ':id' )
	remove(
		@Param( 'id' ) id   : string,
		@Req() request      : Request,
	) {
		const origin = request.headers['origin'];
		return this.requestsService.remove( id, origin );
	}

}
