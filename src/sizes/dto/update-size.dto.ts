import { PartialType } from '@nestjs/swagger';

import { CreateSizeDto } from '@sizes/dto/create-size.dto';


export class UpdateSizeDto extends PartialType( CreateSizeDto ) {}
