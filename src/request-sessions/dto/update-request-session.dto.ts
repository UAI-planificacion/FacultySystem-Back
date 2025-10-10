import { IntersectionType, PartialType } from '@nestjs/swagger';

import { BasicRequestSessionDto }   from '@request-sessions/dto/basic-request-session.dto';
import { StaffUpdateIdDTO }         from '@requests/dto/staff-update-id.dto';


export class UpdateRequestSessionDto extends IntersectionType(
    PartialType( BasicRequestSessionDto ),
    StaffUpdateIdDTO
) {}
