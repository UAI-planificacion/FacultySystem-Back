import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    SpaceType,
    $Enums
} from 'generated/prisma';
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString
} from 'class-validator';


export class BasicSubjectDto {

    @ApiProperty({
        description : 'The id of the subject',
        example     : 'sub-1234567890',
    })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description : 'The name of the subject',
        example     : 'Mathematics 101',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description : 'The cost center ID for the subject',
        example     : 'CC-2025-MATH-101',
    })
    @IsString()
    @IsNotEmpty()
    costCenterId: string;

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

}
