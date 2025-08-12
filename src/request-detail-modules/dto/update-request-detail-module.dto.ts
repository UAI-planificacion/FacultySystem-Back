import { PartialType } from '@nestjs/swagger';
import { CreateRequestDetailModuleDto } from './create-request-detail-module.dto';

export class UpdateRequestDetailModuleDto extends PartialType(CreateRequestDetailModuleDto) {}
