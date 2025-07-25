import { 
	IsString, 
	IsOptional, 
	IsUUID, 
	IsEmail, 
	ValidateIf, 
	IsNotEmpty,
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


/**
 * Custom validator to ensure either requestId or requestDetailId is provided, but not both null
 */
@ValidatorConstraint({ name: 'RequestOrDetailRequired', async: false })
export class RequestOrDetailRequiredConstraint implements ValidatorConstraintInterface {

    validate(value: any, args: ValidationArguments): boolean {
        const object = args.object as CreateCommentDto;
        const hasRequestId = typeof object.requestId === 'string' && object.requestId.trim() !== '';
        const hasRequestDetailId = typeof object.requestDetailId === 'string' && object.requestDetailId.trim() !== '';

        return (hasRequestId && !hasRequestDetailId) || (!hasRequestId && hasRequestDetailId);
    }

    defaultMessage(args: ValidationArguments): string {
        return 'Either requestId or requestDetailId must be provided, but not both or neither.';
    }
}


/**
 * Custom validator to ensure either staffId or (adminName and adminEmail) is provided
 */
@ValidatorConstraint({ name: 'StaffOrAdminAuthorRequired', async: false })
export class StaffOrAdminAuthorRequiredConstraint implements ValidatorConstraintInterface {

    validate(value: any, args: ValidationArguments): boolean {
        const object = args.object as CreateCommentDto;
        const hasStaffId = typeof object.staffId === 'string' && object.staffId.trim() !== '';
        const hasAdminData = typeof object.adminName === 'string' && object.adminName.trim() !== '' &&
            typeof object.adminEmail === 'string' && object.adminEmail.trim() !== '';

        return (hasStaffId && !hasAdminData) || (!hasStaffId && hasAdminData);
    }

    defaultMessage(args: ValidationArguments): string {
        return 'A comment must have a Staff author (staffId) OR an Admin author (adminName and adminEmail), but not both or neither.';
    }
}

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
	@IsUUID()
	requestId?: string;


	@ApiPropertyOptional({
		description	: 'ID of the request detail this comment belongs to',
		example		: '01HXXX...'
	})
	@IsOptional()
	@IsString()
	@IsUUID()
	requestDetailId?: string;


	@ApiPropertyOptional({
		description	: 'ID of the staff member creating the comment',
		example		: '01HXXX...'
	})
	@IsOptional()
	@IsString()
	@IsUUID()
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
