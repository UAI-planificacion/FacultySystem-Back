import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { 
	IsString,
	IsOptional,
	IsEmail,
	ValidateIf,
	IsNotEmpty,
    Length,
} from 'class-validator';


export class CreateCommentDto {

	@ApiProperty({
		description	: 'Content of the comment',
		example		: 'This is a comment about the request'
	})
	@IsString()
	@IsNotEmpty()
	content: string;


	@ApiPropertyOptional({
		description	: 'ID of the request this comment belongs to',
		example		: '01HXXX...'
	})
	@IsOptional()
	@IsString()
	@Length( 24, 26 )
	requestId?: string;


	@ApiPropertyOptional({
		description	: 'ID of the request detail this comment belongs to',
		example		: '01HXXX...'
	})
	@IsOptional()
	@IsString()
	@Length( 24, 26 )
	requestDetailId?: string;


	@ApiPropertyOptional({
		description	: 'ID of the staff member creating the comment',
		example		: '01HXXX...'
	})
	@IsOptional()
	@IsString()
	@Length( 24, 26 )
	staffId?: string;


	@ApiPropertyOptional({
		description	: 'Name of the admin creating the comment (required if staffId is not provided)',
		example		: 'John Doe'
	})
	@IsOptional()
	@IsString()
	@ValidateIf( ( o ) => !o.staffId )
	@IsNotEmpty()
	adminName?: string;


	@ApiPropertyOptional({
		description	: 'Email of the admin creating the comment (required if staffId is not provided)',
		example		: 'admin@example.com'
	})
	@IsOptional()
	@IsEmail()
	@ValidateIf( ( o ) => !o.staffId )
	@IsNotEmpty()
	adminEmail?: string;

}
