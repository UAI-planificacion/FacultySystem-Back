import { ApiPropertyOptional, PartialType }  from '@nestjs/swagger';

import { IsBoolean, IsOptional } from 'class-validator';

import { BasicSectionDto } from '@sections/dto/basic-section.dto';


export class UpdateSectionDto extends PartialType( BasicSectionDto ) {

    @ApiPropertyOptional({
        description : 'Indicates if the section is closed.',
        example     : true,
    })
    @IsOptional()
    @IsBoolean()
    isClosed?: boolean;

}
