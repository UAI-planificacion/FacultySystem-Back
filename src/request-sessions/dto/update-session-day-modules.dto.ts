import { ApiProperty } from "@nestjs/swagger";

import { IsString, Length } from "class-validator";

import { DayModulesIdDto } from "@commons/dtos/day-moduleid.dto";


export class UpdateSessionDayModulesDto extends DayModulesIdDto {

    @ApiProperty({
        type        : String,
        description : 'Request session ID',
        example     : '1',
    })
    @IsString()
    @Length( 24, 28 )
    requestSessionId: string;

}
