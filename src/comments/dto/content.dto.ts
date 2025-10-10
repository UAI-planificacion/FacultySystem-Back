import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty, Length } from 'class-validator';


export class ContentCommentDTO {

    @ApiProperty({
		description	: 'Content of the comment',
		example		: 'This is a comment about the request'
	})
	@IsString()
	@IsNotEmpty()
    @Length( 1, 500 )
	content: string;

}
