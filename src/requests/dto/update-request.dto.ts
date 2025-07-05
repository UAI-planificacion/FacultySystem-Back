import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';

import { BasicRequestDto }  from '@requests/dto/basic-request.dto';
import { CommentDto }       from '@requests/dto/comment.dto';


export class UpdateRequestDto extends IntersectionType( BasicRequestDto, CommentDto ) {

    @ApiPropertyOptional({
        description : 'ID of the staff member creating the request',
        example     : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
    })
    @IsString()
    @Length( 26, 26 )
    staffUpdatedId?: string;

}
