import { ApiProperty, PartialType }  from '@nestjs/swagger';

import { IsBoolean, IsOptional } from 'class-validator';

import { CreateModuleDto } from '@modules/dto/create-module.dto';


export class UpdateModuleDto extends PartialType( CreateModuleDto ) {

    @ApiProperty({
        description: 'Indicates if the module is active or not.',
        example: true,
        required: false,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

}
