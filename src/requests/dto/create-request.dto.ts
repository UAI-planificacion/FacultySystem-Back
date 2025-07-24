import { IntersectionType } from '@nestjs/swagger';

import { BasicRequestDto }  from '@requests/dto/basic-request.dto';
import { StaffCreateIdDTO } from '@requests/dto/staff-create-id.dto';


export class CreateRequestDto extends IntersectionType(
    BasicRequestDto,
    StaffCreateIdDTO
) {}
