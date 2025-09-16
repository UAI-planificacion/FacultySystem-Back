import { ApiProperty } from '@nestjs/swagger';

import { $Enums } from 'generated/prisma';
import { IsEnum } from 'class-validator';

import { CodeDto } from '@sections/dto/fields/code.dto';


export class CommunFilefsSectionDto extends CodeDto {

    @ApiProperty({
        description : 'Session identifier for the section (e.g., "A", "B", "Virtual").',
        example     : $Enums.Session.C,
        maxLength   : 1,
    })
    @IsEnum($Enums.Session, {
        message: `Session must be one of the following values: ${Object.values(
            $Enums.Session,
        ).join( ', ' )}`,
    })
    session: $Enums.Session;

}