import { IntersectionType } from '@nestjs/swagger';

import { PeriodIdDto }  from '@sections/dto/fields/periodId.dto';
import { SpaceSizeIdDto }      from '@sections/dto/fields/size.dto';
import { CodeDto }      from '@sections/dto/fields/code.dto';


export class UpdateGroupDto extends IntersectionType(
    PeriodIdDto,
    SpaceSizeIdDto,
    CodeDto
) {}
