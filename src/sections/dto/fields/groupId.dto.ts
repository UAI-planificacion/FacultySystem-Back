import { ApiProperty } from "@nestjs/swagger";

import { IsUUID } from "class-validator";


export class GroupIdDto {

    @ApiProperty({
        description : 'ID of the group assigned to the section.',
        example     : '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    groupId: string;

}