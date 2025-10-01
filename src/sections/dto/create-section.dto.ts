import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, Length, Max, Min, ValidateNested } from 'class-validator';

import { BasicSectionDto }  from '@sections/dto/basic-section.dto';
import { GroupIdDto }       from '@sections/dto/fields/groupId.dto';
import { PeriodIdDto } from './fields/periodId.dto';
import { SubjectIdDto } from './fields/subjectId.dto';
import { CreateSessionDto } from '@app/sessions/dto/create-session.dto';
import { $Enums } from 'generated/prisma';
import { Type } from 'class-transformer';


export class CreateSectionDto extends IntersectionType(
    BasicSectionDto,
    // GroupIdDto,
    PeriodIdDto,
    SubjectIdDto
) {

    // @ApiProperty({
    //     description : 'ID of the group assigned to the section.',
    //     example     : '123e4567-e89b-12d3-a456-426614174000',
    // })
    // @IsString()
    // @Length( 33, 37 )
    // groupId: string;


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
        description : 'Number of laboratories to create',
        example     : 0,
    })
    @IsNumber()
    @Min( 0 )
    @Max( 1000 )
    @IsNotEmpty()
    laboratory: number;

    @ApiProperty({
        description : 'Number of lectures to create',
        example     : 0,
    })
    @IsNumber()
    @Min( 0 )
    @Max( 1000 )
    @IsNotEmpty()
    lecture: number;

    @ApiProperty({
        description : 'Number of tutoring sessions to create',
        example     : 0,
    })
    @IsNumber()
    @Min( 0 )
    @Max( 1000 )
    @IsNotEmpty()
    tutoringSession: number;


    @ApiProperty({
        description : 'Number of workshops to create',
        example     : 0,
    })
    @IsNumber()
    @Min( 0 )
    @Max( 1000 )
    @IsNotEmpty()
    workshop: number;


    // @ApiProperty({
    //     type        : [CreateSessionDto],
    //     description : 'Sesiones asociadas a la sección',
    //     example     : [
    //         {
    //             name        : $Enums.SessionName.C,
    //             spaceId     : 'A101',
    //             sectionId   : '01HKXYZ123ABC456DEF789',
    //             professorId : '01HKXYZ123ABC456DEF789',
    //             dayModuleId : 1,
    //             size        : $Enums.SizeValue.S,
    //             correctedRegistrants : 10,
    //             realRegistrants : 10,
    //             plannedBuilding : 'A',
    //             chairsAvailable : 10,
    //             isEnglish : false
    //         }
    //     ]
    // })
    // @IsArray()
    // @Type(() => CreateSessionDto)
    // @ValidateNested()
    // sessions : CreateSessionDto[]

}
