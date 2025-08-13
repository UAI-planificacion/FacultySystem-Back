import { ApiProperty } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';


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
        example     : '1'
    })
    @IsString()
    @Length( 1, 50 )
    headquartersId : string;

}
