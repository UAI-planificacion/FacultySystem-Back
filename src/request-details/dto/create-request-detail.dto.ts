import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';

import { BasicRequestDetailDto }    from '@request-details/dto/basic-request-detail.dto';
import { StaffCreateIdDTO }         from '@requests/dto/staff-create-id.dto';


export class CreateRequestDetailDto extends IntersectionType(
    BasicRequestDetailDto,
    StaffCreateIdDTO
) {

    @ApiProperty({ description: 'Request ID' })
    @IsString()
    @Length( 26, 26 )
    requestId: string;

}
