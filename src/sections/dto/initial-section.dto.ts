import { IntersectionType } from '@nestjs/swagger';

import { CommunFilefsSectionDto }   from '@sections/dto/commun-fields.dto';
import { PeriodIdDto }              from '@app/commons/dtos/periodId.dto';
import { GroupIdDto }               from '@sections/dto/fields/groupId.dto';


export class CreateInitialSectionDto extends IntersectionType(
    CommunFilefsSectionDto,
    PeriodIdDto,
    GroupIdDto
) {}
