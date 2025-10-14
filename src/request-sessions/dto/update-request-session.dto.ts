import { PartialType } from '@nestjs/swagger';

import { BasicRequestSessionDto }   from '@request-sessions/dto/basic-request-session.dto';


export class UpdateRequestSessionDto extends PartialType( BasicRequestSessionDto ) {}
