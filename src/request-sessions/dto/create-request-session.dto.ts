import { ApiExtraModels } from '@nestjs/swagger';

import { BasicRequestSessionDto } from "@request-sessions/dto/basic-request-session.dto";


@ApiExtraModels()
export class CreateRequestSessionDto extends BasicRequestSessionDto {}
