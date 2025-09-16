import { ApiProperty } from '@nestjs/swagger';

import {
    IsArray,
    IsNotEmpty,
    IsString,
    Matches,
    ArrayNotEmpty,
    ArrayMinSize,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    registerDecorator,
    ValidationOptions,
    ArrayUnique,
} from 'class-validator';


@ValidatorConstraint({ name: 'isEndDateAfterStartDate', async: false })
export class IsEndDateAfterStartDateConstraint implements ValidatorConstraintInterface {
    validate( endDate: string, args: ValidationArguments ) {
        const [relatedPropertyName] = args.constraints;
        const startDate = ( args.object as any )[relatedPropertyName];

        if ( !startDate || !endDate ) {
            return true;
        }

        return endDate > startDate;
    }

    defaultMessage( args: ValidationArguments ) {
        const [relatedPropertyName] = args.constraints;
        return `endHour must be after ${relatedPropertyName}.`;
    }
}

export function IsEndDateAfterStartDate(
    property: string,
    validationOptions?: ValidationOptions
): ( object: Object, propertyName: string ) => void {
    return function ( object: Object, propertyName: string ) {
        registerDecorator({
            target          : object.constructor,
            propertyName    : propertyName,
            options         : validationOptions,
            constraints     : [property],
            validator       : IsEndDateAfterStartDateConstraint,
        });
    };
}

export class CreateModuleDto {
    @ApiProperty({
        description: 'The code of the module.',
        example: 'M101',
    })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({
        description: 'The start hour of the module in HH:MM format.',
        example: '08:00',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'startHour must be in HH:MM format (e.g., 08:00 or 14:30)',
    })
    startHour: string;

    @ApiProperty({
        description: 'The end hour of the module in HH:MM format. Must be after startHour.',
        example: '10:00',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'endHour must be in HH:MM format (e.g., 08:00 or 14:30)',
    })
    @IsEndDateAfterStartDate('startHour', {
        message: 'endHour must be after startHour.',
    })
    endHour: string;

    @ApiProperty({
        description: 'An array of Day codes (IDs) to associate with this module. All codes must be unique.',
        example: ['1', '2', '3'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @ArrayUnique()
    dayIds: number[];

}
