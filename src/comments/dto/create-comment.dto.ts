import { ApiPropertyOptional } from '@nestjs/swagger';

import { 
	IsString,
	IsOptional,
    Length,
} from 'class-validator';

import { ContentCommentDTO } from '@comments/dto/content.dto';


export class CreateCommentDto  extends ContentCommentDTO {

	@ApiPropertyOptional({
		description	: 'ID of the request this comment belongs to',
		example		: '01HXXX...'
	})
	@IsOptional()
	@IsString()
	@Length( 24, 26 )
	requestSessionId?: string;


	@ApiPropertyOptional({
		description	: 'ID of the request detail this comment belongs to',
		example		: '01HXXX...'
	})
	@IsOptional()
	@IsString()
	@Length( 24, 26 )
	planningChangeId?: string;


	@ApiPropertyOptional({
		description	: 'ID of the staff member creating the comment',
		example		: '01HXXX...'
	})
	@IsString()
	@Length( 24, 26 )
	staffId: string;

}
