import { ApiProperty } from "@nestjs/swagger";

import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";


export class SessionDto {

    @ApiProperty({
        description : 'Number of laboratories to create',
        example     : 0,
    })
    @IsNumber()
    @Min( 0 )
    @Max( 1000 )
    @IsNotEmpty()
    laboratory: number;

    @ApiProperty({
        description : 'Number of lectures to create',
        example     : 0,
    })
    @IsNumber()
    @Min( 0 )
    @Max( 1000 )
    @IsNotEmpty()
    lecture: number;

    @ApiProperty({
        description : 'Number of tutoring sessions to create',
        example     : 0,
    })
    @IsNumber()
    @Min( 0 )
    @Max( 1000 )
    @IsNotEmpty()
    tutoringSession: number;


    @ApiProperty({
        description : 'Number of workshops to create',
        example     : 0,
    })
    @IsNumber()
    @Min( 0 )
    @Max( 1000 )
    @IsNotEmpty()
    workshop: number;

}
