import { ApiProperty } from '@nestjs/swagger';

import { Type }                     from 'class-transformer';
import { IsArray, ValidateNested }  from 'class-validator';


export class DayModulesIdDto {

    @ApiProperty({
        description : 'Module days',
        isArray     : true,
        type        : [Number]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Number)
    dayModulesId :number[] = [];

}
