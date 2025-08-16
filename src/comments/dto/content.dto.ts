import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';


export class ContentCommentDTO {

    @ApiProperty({
		description	: 'Content of the comment',
		example		: 'This is a comment about the request'
	})
	@IsString()
	@IsNotEmpty()
	content: string;

}
