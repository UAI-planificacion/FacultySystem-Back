import { ApiProperty } from '@nestjs/swagger';

import {
    IsArray,
    IsString,
    Length,
    MinLength,
    ValidateNested
}               from 'class-validator';
import { Type } from 'class-transformer';

import { CreateRequestDetailDto }   from '@request-details/dto/create-request-detail.dto';
import { BasicRequestDto }          from '@requests/dto/basic-request.dto';


export class CreateRequestDto extends BasicRequestDto {

    @ApiProperty({ 
        description : 'ID of the staff member creating the request',
        example     : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
    })
    @IsString()
    @Length( 26, 26 )
    staffCreateId: string;

    @ApiProperty({ 
        type        : [CreateRequestDetailDto],
        description : 'List of request details'
    })
    @ValidateNested({ each: true })
    @Type( () => CreateRequestDetailDto )
    @IsArray()
    @MinLength( 1 )
    details: CreateRequestDetailDto[];

}
