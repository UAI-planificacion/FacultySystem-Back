import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, Length } from 'class-validator';


export class CommentDto {

    @ApiPropertyOptional({
        description : 'Comment of the request',
        example     : 'Comment of the request'
    })
    @IsString()
    @Length( 0, 255 )
    @IsOptional()
    comment?: string;

}
