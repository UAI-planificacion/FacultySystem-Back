import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsOptional } from 'class-validator';

import { CreatePeriodDto } from '@periods/dto/create-period.dto';


export enum PeriodStatusDto {
    InProgress = 'InProgress',
    Closed = 'Closed',
}


export class UpdatePeriodDto extends PartialType(CreatePeriodDto) {

    @ApiPropertyOptional({
        description: 'The status of the period.',
        enum: PeriodStatusDto,
        example: PeriodStatusDto.InProgress,
        default: PeriodStatusDto.InProgress,
    })
    @IsOptional()
    @IsEnum(PeriodStatusDto)
    status?: PeriodStatusDto = PeriodStatusDto.InProgress;

}
