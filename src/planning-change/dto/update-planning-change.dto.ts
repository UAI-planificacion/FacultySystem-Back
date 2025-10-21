import { IntersectionType, PartialType } from '@nestjs/swagger';

import { BasicPlanningChangeDto }   from '@planning-change/dto/basic-planning-change.dto';
import { StaffUpdateIdDTO }         from '@requests/dto/staff-update-id.dto';


export class UpdatePlanningChangeDto extends IntersectionType(
    PartialType ( BasicPlanningChangeDto ),
    StaffUpdateIdDTO
) {}
