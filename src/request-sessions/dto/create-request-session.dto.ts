import { ApiExtraModels, IntersectionType } from '@nestjs/swagger';

import { DayModulesIdDto }          from '@commons/dtos/day-moduleid.dto';
import { BasicRequestSessionDto }   from "@request-sessions/dto/basic-request-session.dto";


@ApiExtraModels()
export class CreateRequestSessionDto extends IntersectionType(
    BasicRequestSessionDto,
    DayModulesIdDto
) {}
