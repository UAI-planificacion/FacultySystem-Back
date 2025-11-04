import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsInt,
    IsOptional,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
}                   from 'class-validator';
import { $Enums }   from 'generated/prisma';


@ValidatorConstraint({ name: 'customSizeLogic', async: false })
export class CustomSizeLogicConstraint implements ValidatorConstraintInterface {
    validate( _: any, args: ValidationArguments ) {
        const dto = args.object as CreateSizeDto;
        const { min, max, lessThan, greaterThan } = dto;

        const hasMin = min !== undefined && min !== null;
        const hasMax = max !== undefined && max !== null;
        const hasLessThan = lessThan !== undefined && lessThan !== null;
        const hasGreaterThan = greaterThan !== undefined && greaterThan !== null;

        if (( hasMin && !hasMax ) || ( !hasMin && hasMax ))         return false;
        if ( hasLessThan && ( hasMin || hasMax || hasGreaterThan )) return false;
        if ( hasGreaterThan && ( hasMin || hasMax || hasLessThan )) return false;
        
        const noOptionalFields      = !hasMin           && !hasMax  && !hasLessThan && !hasGreaterThan;
        const minMaxPresent         = hasMin            && hasMax   && !hasLessThan && !hasGreaterThan;
        const lessThanPresent       = hasLessThan       && !hasMin  && !hasMax      && !hasGreaterThan;
        const greaterThanPresent    = hasGreaterThan    && !hasMin  && !hasMax      && !hasLessThan; 

        return noOptionalFields || minMaxPresent || lessThanPresent || greaterThanPresent;
    }

    defaultMessage( _: ValidationArguments) {
        return 'Invalid combination of size parameters. Valid combinations are: (min and max together), or (only lessThan), or (only greaterThan), or no optional parameters.';
    }
}


export class CreateSizeDto {
    @ApiHideProperty()
    @Validate( CustomSizeLogicConstraint )
    _classValidationCheck?: unknown;

    @ApiProperty({
        enum: $Enums.SizeValue,
        description: 'The unique identifier for the size category.',
        example: $Enums.SizeValue.M,
    })
    @IsEnum($Enums.SizeValue)
    id: $Enums.SizeValue;

    @ApiProperty({
        description:
        'Minimum value for this size category (optional). Represents an inclusive lower bound. Must be provided with max.',
        example: 10,
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsInt({ message: 'Minimum value must be an integer.' })
    min?: number;

    @ApiProperty({
        description:
        'Maximum value for this size category (optional). Represents an inclusive upper bound. Must be provided with min.',
        example: 20,
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsInt({ message: 'Maximum value must be an integer.' })
    max?: number;

    @ApiProperty({
        description:
        'Value that the capacity must be less than (exclusive upper bound, optional). Cannot be combined with min, max, or greaterThan.',
        example: 30,
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsInt({ message: 'Less than value must be an integer.' })
    lessThan?: number;

    @ApiProperty({
        description:
        'Value that the capacity must be greater than (exclusive lower bound, optional). Cannot be combined with min, max, or lessThan.',
        example: 5,
        required: false,
        type: Number,
    })
    @IsOptional()
    @IsInt({ message: 'Greater than value must be an integer.' })
    greaterThan?: number;

}
