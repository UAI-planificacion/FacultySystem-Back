import { IntersectionType } from '@nestjs/swagger';

import { FacultyIdDto } from '@app/faculties/dto/faculty-id.dto';
import { BasicSubjectDto } from './basic-subject.dto';

export class CreateSubjectDto extends IntersectionType(
    BasicSubjectDto,
    FacultyIdDto,
) {}
