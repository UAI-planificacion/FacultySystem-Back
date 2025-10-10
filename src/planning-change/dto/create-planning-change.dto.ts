import { IntersectionType } from "@nestjs/swagger";

import { BasicPlanningChangeDto }   from "@planning-change/dto/basic-planning-change.dto";
import { StaffCreateIdDTO }         from "@requests/dto/staff-create-id.dto";


export class CreatePlanningChangeDto extends IntersectionType(
    BasicPlanningChangeDto,
    StaffCreateIdDTO
) {}
