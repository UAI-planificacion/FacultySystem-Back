import { IntersectionType } from '@nestjs/swagger';


import { BasicRequestDto }  from '@requests/dto/basic-request.dto';
import { CommentDto }       from '@requests/dto/comment.dto';
import { StaffUpdateIdDTO } from '@requests/dto/staff-update-id.dto';


export class UpdateRequestDto extends IntersectionType(
    BasicRequestDto,
    CommentDto,
    StaffUpdateIdDTO
) {}
