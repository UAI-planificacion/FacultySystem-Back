import { ApiPropertyOptional } from "@nestjs/swagger";

import { IsOptional, IsString, Length } from "class-validator";


export class ProfessorIdDto {

    @ApiPropertyOptional({
        type        : String,
        description : 'ID of the professor assigned to the section.',
        example     : 'PROF001'
    })
    @IsOptional()
    @IsString({ message: 'Professor ID must be a string.' })
    @Length( 1, 10 )
    professorId?: string;

}
