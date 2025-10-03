import { PartialType } from '@nestjs/swagger';

import { BaseSessionDto } from '@sessions/dto/base-session.dto';


export class UpdateSessionDto extends PartialType( BaseSessionDto ) {}
