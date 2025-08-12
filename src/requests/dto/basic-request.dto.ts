import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsBoolean,
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

    @ApiPropertyOptional({ 
        description : 'Whether the request is for consecutive days',
        default     : false 
    })
    @IsOptional()
    @IsBoolean()
    isConsecutive: boolean = false;

    @ApiPropertyOptional({ 
        description : 'Description of the request',
        example     : 'Request for classroom with projector'
    })
    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    description?: string;

    @ApiProperty({ 
        description : 'ID of the subject this request is for',
        example     : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
    })
    @IsString()
    @Length( 2, 50 )
    subjectId: string;


    @ApiProperty({ 
        description : 'ID of the period this request is for',
        example     : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
    })
    @IsString()
    @Length( 2, 50 )
    periodId: string;

}
