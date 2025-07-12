import { ApiProperty } from '@nestjs/swagger';

import {
    IsString,
    Length,
}from 'class-validator';

import { BasicRequestDetailDto } from './basic-request-detail.dto';


export class CreateRequestDetailDto extends BasicRequestDetailDto {

    @ApiProperty({ description: 'Request ID' })
    @IsString()
    @Length( 26, 26 )
    requestId: string;

}
