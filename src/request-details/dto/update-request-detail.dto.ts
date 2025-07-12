import { IntersectionType } from '@nestjs/swagger';

import { CommentDto }               from '@requests/dto/comment.dto';
import { BasicRequestDetailDto } from './basic-request-detail.dto';


export class UpdateRequestDetailDto extends IntersectionType(
    BasicRequestDetailDto,
    CommentDto
) {}
