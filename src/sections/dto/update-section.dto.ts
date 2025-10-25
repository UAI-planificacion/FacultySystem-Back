import { ApiPropertyOptional, PartialType }  from '@nestjs/swagger';

import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

import { BasicSectionDto } from '@sections/dto/basic-section.dto';


export class UpdateSectionDto extends PartialType( BasicSectionDto ) {

    @ApiPropertyOptional({
        description : 'Indicates if the section is closed.',
        example     : true,
    })
    @IsOptional()
    @IsBoolean()
    isClosed?: boolean;


    @ApiPropertyOptional({
        description : 'The code of the section.',
        example     : 1,
    })
    @IsOptional()
    @IsNumber()
    @Min( 1, { message: 'Section code must be at least 1.' } )
    @Max( 100, { message: 'Section code must be at most 100.' } )
    code?: number;

}
