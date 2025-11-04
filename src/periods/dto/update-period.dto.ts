import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';

import { $Enums }               from 'generated/prisma';
import { IsEnum, IsOptional }   from 'class-validator';

import { CreatePeriodDto } from '@periods/dto/create-period.dto';


export class UpdatePeriodDto extends PartialType( CreatePeriodDto ) {

    @ApiPropertyOptional({
        description: 'The status of the period.',
        enum: $Enums.PeriodStatus,
        example: $Enums.PeriodStatus.InProgress,
        default: $Enums.PeriodStatus.InProgress,
    })
    @IsOptional()
    @IsEnum($Enums.PeriodStatus)
    status?: $Enums.PeriodStatus = $Enums.PeriodStatus.InProgress;

}
