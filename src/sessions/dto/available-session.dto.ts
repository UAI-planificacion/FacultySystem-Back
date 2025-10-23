import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { IsNumber, IsOptional, IsString, Length } from "class-validator";


export class AvailableSessionDto {

    @ApiProperty({
        description: 'Session ID',
        example: '123456789012345678901234'
    })
    @IsString()
    @Length( 26, 28 )
    sessionId: string;


    @ApiProperty({
        description: 'DayModule ID',
        example: 1
    })
    @IsNumber()
    dayModuleId: number;


    @ApiProperty({
        description: 'Space ID',
        example: '123456789012345678901234'
    })
    @IsString()
    @Length( 2, 15 )
    spaceId: string;


    @ApiPropertyOptional({
        description: 'Professor ID',
        example: '123456789012345678901234'
    })
    @IsString()
    @IsOptional()
    @Length( 2, 15 )
    professorId?: string | null;

}    
