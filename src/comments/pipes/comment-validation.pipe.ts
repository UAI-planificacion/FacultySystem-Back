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

        const object                  = plainToInstance( metatype, value );
        const hasRequestSessionId     = typeof object.requestSessionId === 'string' && object.requestSessionId.trim() !== '';
        const hasPlanningChangeId     = typeof object.planningChangeId === 'string' && object.planningChangeId.trim() !== '';

        if (( hasRequestSessionId && hasPlanningChangeId ) || ( !hasRequestSessionId && !hasPlanningChangeId )) {
            throw new BadRequestException( 'Either requestSessionId or planningChangeId must be provided, but not both or neither.' );
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
