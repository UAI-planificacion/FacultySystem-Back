import { PartialType } from '@nestjs/swagger';

import { BasicSubjectDto } from '@subjects/dto/basic-subject.dto';

export class UpdateSubjectDto extends PartialType( BasicSubjectDto ) {}
