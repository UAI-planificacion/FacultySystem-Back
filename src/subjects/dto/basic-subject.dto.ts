import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    SpaceType,
    $Enums
} from 'generated/prisma';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
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
        description : 'Count of workshops',
        example     : 0,
    })
    @IsNumber()
    @IsNotEmpty()
    workshop: number;

    @ApiProperty({
        description : 'Count of lectures',
        example     : 0,
    })
    @IsNumber()
    @IsNotEmpty()
    lecture: number;

    @ApiProperty({
        description : 'Count of tutoring sessions',
        example     : 0,
    })
    @IsNumber()
    @IsNotEmpty()
    tutoringSession: number;

    @ApiProperty({
        description : 'Count of laboratories',
        example     : 0,
    })
    @IsNumber()
    @IsNotEmpty()
    laboratory: number;

}
