import { IntersectionType } from '@nestjs/swagger';

import { CommentDto }               from '@requests/dto/comment.dto';
import { CreateRequestDetailDto }   from '@request-details/dto/create-request-detail.dto';


export class UpdateRequestDetailDto extends IntersectionType( CreateRequestDetailDto, CommentDto ) {}
