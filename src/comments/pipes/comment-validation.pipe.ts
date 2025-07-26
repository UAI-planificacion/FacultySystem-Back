// src/common/pipes/comment-validation.pipe.ts
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { CreateCommentDto } from '@comments/dto/create-comment.dto';


@Injectable()
export class CommentValidationPipe implements PipeTransform {
    async transform( value: CreateCommentDto, { metatype }: ArgumentMetadata ) {
        if ( !metatype || !this.toValidate( metatype )) {
            return value;
        }

        const object                = plainToInstance( metatype, value );
        const hasRequestId          = typeof object.requestId === 'string' && object.requestId.trim() !== '';
        const hasRequestDetailId    = typeof object.requestDetailId === 'string' && object.requestDetailId.trim() !== '';

        if (( hasRequestId && hasRequestDetailId ) || ( !hasRequestId && !hasRequestDetailId )) {
            throw new BadRequestException('Either requestId or requestDetailId must be provided, but not both or neither.');
        }

        const hasStaffId = typeof object.staffId === 'string' && object.staffId.trim() !== '';
        const hasAdminData = typeof object.adminName === 'string' && object.adminName.trim() !== '' &&

        typeof object.adminEmail === 'string' && object.adminEmail.trim() !== '';

        if (( hasStaffId && hasAdminData ) || ( !hasStaffId && !hasAdminData )) {
            throw new BadRequestException( 'A comment must have a Staff author (staffId) OR an Admin author (adminName and adminEmail), but not both or neither.' );
        }

        return value;
    }

    private toValidate( metatype: Function ): boolean {
        const types: Function[] = [ String, Boolean, Number, Array, Object ];
        return !types.includes( metatype );
    }

}
