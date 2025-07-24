import { IntersectionType } from '@nestjs/swagger';

import { CommentDto }               from '@requests/dto/comment.dto';
import { BasicRequestDetailDto }    from '@request-details/dto/basic-request-detail.dto';
import { StaffUpdateIdDTO }           from '@requests/dto/staff-update-id.dto';


export class UpdateRequestDetailDto extends IntersectionType(
    BasicRequestDetailDto,
    CommentDto,
    StaffUpdateIdDTO
) {}
