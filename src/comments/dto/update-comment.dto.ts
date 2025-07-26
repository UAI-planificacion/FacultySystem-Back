import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';


export class UpdateCommentDto {

    @ApiProperty({
		description	: 'Content of the comment',
		example		: 'This is a comment about the request'
	})
	@IsString()
	@IsNotEmpty()
	content: string;

}
