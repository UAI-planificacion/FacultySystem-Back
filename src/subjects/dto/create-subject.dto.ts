import { IntersectionType } from '@nestjs/swagger';

import { FacultyIdDto }     from '@faculties/dto/faculty-id.dto';
import { BasicSubjectDto }  from '@subjects/dto/basic-subject.dto';


export class CreateSubjectDto extends IntersectionType(
    BasicSubjectDto,
    FacultyIdDto,
) {}
