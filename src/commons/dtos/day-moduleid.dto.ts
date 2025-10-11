import { ApiProperty } from '@nestjs/swagger';

import { Type }     from 'class-transformer';
import { IsArray }  from 'class-validator';


export class DayModulesIdDto {

    @ApiProperty({
        description : 'Module days',
        isArray     : true,
        type        : [Number]
    })
    @IsArray()
    @Type(() => Number)
    dayModulesId :number[] = [];

}
