import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';


export class CreateRequestDetailModuleDto {

    @ApiPropertyOptional({ description: 'Module ID' })
    @Length( 1, 1 )
    moduleId: string;

    @ApiPropertyOptional({
        type        : [String],
        description : 'Days of the week'
    })
    @IsString()
    @Length( 1, 1 )
    day: string;

}
