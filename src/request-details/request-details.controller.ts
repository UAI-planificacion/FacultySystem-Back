import { Request } from 'express';

import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';

import { RequestDetailsService }    from '@request-details/request-details.service';
import { CreateRequestDetailDto }   from '@request-details/dto/create-request-detail.dto';
import { UpdateRequestDetailDto }   from '@request-details/dto/update-request-detail.dto';


@Controller( 'request-details' )
export class RequestDetailsController {
    constructor(
        private readonly requestDetailsService: RequestDetailsService
    ) {}


    @Post()
    create(
        @Body() createRequestDetailDto: CreateRequestDetailDto,
        @Req() request: Request,
    ) {
        const origin = request.headers['origin'];
        return this.requestDetailsService.create( createRequestDetailDto, origin );
    }


    // @Get( '/request/:requestId' )
    // findAll(
    //     @Param( 'requestId' ) requestId: string
    // ) {
    //     return this.requestDetailsService.findAll( requestId );
    // }


    // @Get( ':id' )
    // findOne(
    //     @Param( 'id' ) id: string
    // ) {
    //     return this.requestDetailsService.findOne( id );
    // }


    // @Patch( ':id' )
    // update(
    //     @Param( 'id' ) id: string,
    //     @Body() updateRequestDetailDto: UpdateRequestDetailDto,
    //     @Req() request: Request,
    // ) {
    //     const origin = request.headers['origin'];
    //     return this.requestDetailsService.update( id, updateRequestDetailDto, origin );
    // }


    // @Delete( ':id' )
    // remove(
    //     @Param( 'id' ) id: string,
    //     @Req() request: Request,
    // ) {
    //     const origin = request.headers['origin'];
    //     return this.requestDetailsService.remove( id, origin );
    // }

}
