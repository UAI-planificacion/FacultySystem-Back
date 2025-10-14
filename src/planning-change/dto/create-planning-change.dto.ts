import { ApiExtraModels, IntersectionType } from "@nestjs/swagger";

import { DayModulesIdDto }          from "@commons/dtos/day-moduleid.dto";
import { BasicPlanningChangeDto }   from "@planning-change/dto/basic-planning-change.dto";
import { StaffCreateIdDTO }         from "@requests/dto/staff-create-id.dto";


@ApiExtraModels()
export class CreatePlanningChangeDto extends IntersectionType(
    BasicPlanningChangeDto,
    StaffCreateIdDTO,
    DayModulesIdDto
) {}
