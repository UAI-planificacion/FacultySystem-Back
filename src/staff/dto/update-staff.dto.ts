import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsBoolean, IsOptional } from 'class-validator';

import { BasicStaffDto } from '@staff/dto/basic-staff.dto';

export class UpdateStaffDto extends PartialType( BasicStaffDto ) {

    @ApiPropertyOptional({
        description : 'Is active',
        example     : true
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

}
