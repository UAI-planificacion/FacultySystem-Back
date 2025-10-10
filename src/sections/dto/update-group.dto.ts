import { IntersectionType } from '@nestjs/swagger';

import { PeriodIdDto }      from '@commons/dtos/periodId.dto';
import { SpaceSizeIdDto }   from '@commons/dtos/size.dto';
import { CodeDto }          from '@sections/dto/fields/code.dto';


export class UpdateGroupDto extends IntersectionType(
    PeriodIdDto,
    SpaceSizeIdDto,
    CodeDto
) {}
