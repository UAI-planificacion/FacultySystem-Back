import { IntersectionType } from '@nestjs/swagger';

import { FacultyIdDto }     from '@app/faculties/dto/faculty-id.dto';
import { BasicStaffDto }    from '@staff/dto/basic-staff.dto';


export class CreateStaffDto extends IntersectionType( BasicStaffDto, FacultyIdDto ) {}
