import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

import { BasicSectionDto }  from '@sections/dto/basic-section.dto';
import { PeriodIdDto }      from '@commons/dtos/periodId.dto';
import { SubjectIdDto }     from '@commons/dtos/subjectId.dto';
import { SessionDto }       from '@sessions/dto/session.dto';


export class CreateSectionDto extends IntersectionType(
    BasicSectionDto,
    PeriodIdDto,
    SubjectIdDto,
    SessionDto
) {

    @ApiProperty({
        description : 'Number of sections to create',
        example     : 1,
    })
    @IsNumber()
    @Min( 1 )
    @Max( 1000 )
    @IsNotEmpty()
    numberOfSections: number;


    @ApiProperty({
        description: 'The quota of the section.',
        example: 10,
    })
    @IsNumber()
    @Min( 1 )
    @Max( 1000 )
    quota: number;

}
