import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';


export class CreateModuleDayDto {

    @ApiPropertyOptional({ description: 'Module ID' })
    @Length( 1, 20 )
    moduleId: string;

    @ApiPropertyOptional({
        type        : [String],
        description : 'Days of the week'
    })
    @IsString()
    @Length( 1, 1 )
    day: string;

}
