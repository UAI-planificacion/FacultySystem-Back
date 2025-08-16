import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsString, Length } from 'class-validator';


import { headquarters } from 'generated/prisma';

export class CreateGradeDto {

    @ApiProperty({ 
        description : 'Name of the grade',
        example     : 'Grade 1'
    })
    @IsString()
    @Length( 3, 50 )
    name: string;

    @ApiProperty({ 
        description : 'Id of the headquarter',
        example     : 'ERRAZURIZ'
    })
    @Length( 5, 20 )
    @IsEnum( headquarters )
    headquartersId : headquarters;

}
