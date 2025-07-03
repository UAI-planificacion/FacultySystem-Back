import { PartialType }  from '@nestjs/swagger';

import { BasicStaffDto } from './basic-staff.dto';

export class UpdateStaffDto extends PartialType( BasicStaffDto ) {}
