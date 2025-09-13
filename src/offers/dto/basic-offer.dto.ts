import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    SpaceType,
    Building,
    $Enums
} from 'generated/prisma';

import {
    IsArray,
    IsBoolean,
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length
}               from 'class-validator';
import { Type } from 'class-transformer';


export class BasicOfferDto {

    @ApiPropertyOptional({
        description : 'The start date of the subject',
        example     : '2025-08-01T00:00:00.000Z',
    })
    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type( () => Date )
    startDate: Date[] = [];

    @ApiPropertyOptional({
        description : 'The end date of the subject',
        example     : '2025-12-15T00:00:00.000Z',
    })
    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type( () => Date )
    endDate: Date[] = [];

    @ApiPropertyOptional({
        description : 'The cost center ID for the subject',
        example     : 'CC-2025-MATH-101',
    })
    @IsString()
    @IsOptional()
    @Length(0, 50)
    costCenterId?: string;

    @ApiPropertyOptional({
        description : 'Is English',
        example     : true
    })
    @IsOptional()
    @IsBoolean()
    isEnglish?: boolean;

    @ApiPropertyOptional({
        enum        : Object.values( Building ),
        description : 'Building name or identifier'
    })
    @IsOptional()
    @IsString()
    @IsEnum( Building )
    building?: Building;

    @ApiPropertyOptional({
        enum        : Object.values( SpaceType ),
        description : $Enums.SpaceType.ROOM
    })
    @IsOptional()
    @IsString()
    @IsEnum( $Enums.SpaceType )
    spaceType?: $Enums.SpaceType;

    @ApiPropertyOptional({
        description : 'Size of the space',
        example     : $Enums.SizeValue.XL,
    })
    @IsOptional()
    @IsEnum( $Enums.SizeValue )
    spaceSizeId?: $Enums.SizeValue;


    @ApiProperty({
        description : 'Period ID',
        example     : '4008'
    })
    @IsString()
    @IsNotEmpty()
    @Length( 3, 8 )
    periodId: string;

    @ApiPropertyOptional({
        description : 'Lecture',
        example     : '1'
    })
    @IsOptional()
    @IsNumber()
    lecture?: number;

    @ApiPropertyOptional({
        description : 'Workshop',
        example     : '1'
    })
    @IsOptional()
    @IsNumber()
    workshop?: number;

    @ApiPropertyOptional({
        description : 'Laboratory',
        example     : '1'
    })
    @IsOptional()
    @IsNumber()
    laboratory?: number;

    @ApiPropertyOptional({
        description : 'Tutoring session',
        example     : '1'
    })
    @IsOptional()
    @IsNumber()
    tutoringSession?: number;

}
