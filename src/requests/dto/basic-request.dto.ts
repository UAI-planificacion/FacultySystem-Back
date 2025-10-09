import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsEnum,
    IsOptional,
    IsString,
    Length,
}                   from 'class-validator';
import { Status }   from 'generated/prisma';


export class BasicRequestDto {

    @ApiProperty({ 
        description : 'Title of the request',
        example     : 'Request for classroom with projector'
    })
    @IsString()
    @Length( 3, 255 )
    title: string;

    @ApiPropertyOptional({ 
        description : 'Request status',
        enum        : Object.values( Status ),
        default     : Status.PENDING
    })
    @IsString()
    @IsOptional()
    @IsEnum( Status )
    status: Status = Status.PENDING;

}
