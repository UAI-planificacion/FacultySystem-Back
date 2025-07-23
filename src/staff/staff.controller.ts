import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { StaffService }     from '@staff/staff.service';
import { CreateStaffDto }   from '@staff/dto/create-staff.dto';
import { UpdateStaffDto }   from '@staff/dto/update-staff.dto';

@Controller( 'staff' )
export class StaffController {
    constructor(
        private readonly staffService: StaffService
    ) {}


    @Post()
    create(
        @Body() createStaffDto: CreateStaffDto
    ) {
        return this.staffService.create( createStaffDto );
    }


    @Get( 'all/:facultyId' )
    findAll(
        @Param( 'facultyId' ) facultyId: string
    ) {
        return this.staffService.findAll( facultyId );
    }


    @Get( ':id' )
    findOne(
        @Param( 'id' ) id: string
    ) {
        return this.staffService.findOne( id );
    }


    @Patch( ':id' )
    update(
        @Param( 'id' ) id: string,
        @Body() updateStaffDto: UpdateStaffDto
    ) {
        return this.staffService.update( id, updateStaffDto );
    }


    @Delete( ':id' )
    remove(
        @Param( 'id' ) id: string
    ) {
        return this.staffService.remove( id );
    }

}
