import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsString, Length, IsArray, ValidateNested, ArrayMaxSize, ArrayMinSize } from 'class-validator';

import { BasicRequestDto }              from '@requests/dto/basic-request.dto';
import { StaffCreateIdDTO }             from '@requests/dto/staff-create-id.dto';
import { CreateRequestSessionDto }      from '@request-sessions/dto/create-request-session.dto';


export class CreateRequestDto extends IntersectionType(
    BasicRequestDto,
    StaffCreateIdDTO
) {

    @ApiProperty({ 
        description : 'ID of the offer this request is for',
        example     : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
    })
    @IsString()
    @Length( 24, 27 )
    sectionId: string;


    @ApiProperty({
        description : 'List of request sessions to create with the request (max 4)',
        type        : [ CreateRequestSessionDto ],
        example     : []
    })
    @IsArray()
    @ArrayMinSize( 1 )
    @ArrayMaxSize( 4 )
    @ValidateNested({ each: true })
    @Type(() => CreateRequestSessionDto )
    requestSessions: CreateRequestSessionDto[];

}
