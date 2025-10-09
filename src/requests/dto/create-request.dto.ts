import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';

import { BasicRequestDto }  from '@requests/dto/basic-request.dto';
import { StaffCreateIdDTO } from '@requests/dto/staff-create-id.dto';


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

}
