import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString, Length, Max } from 'class-validator';

import { SessionDto }       from '@sessions/dto/session.dto';
import { SpaceSizeIdDto }   from '@commons/dtos/size.dto';
import { SpaceTypeDto }     from '@commons/dtos/space-type.dto';


export class BasicSubjectDto extends IntersectionType(
    SessionDto,
    SpaceSizeIdDto,
    SpaceTypeDto
) {

    @ApiProperty({
        description : 'The id of the subject',
        example     : 'sub-1234567890',
    })
    @IsString()
    @IsNotEmpty()
    @Length( 3, 15 )
    id: string;


    @ApiProperty({
        description : 'The name of the subject',
        example     : 'Mathematics 101',
    })
    @IsString()
    @IsNotEmpty()
    @Length( 3, 200 )
    name: string;


    @ApiPropertyOptional({
        description : 'The id of the grade',
        example     : '1234567890',
    })
    @IsString()
    @IsOptional()
    @Max( 28 )
    gradeId?: string;

}
