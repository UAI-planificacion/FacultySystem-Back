import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { BasicOfferDto } from './basic-offer.dto';
import { IsNotEmpty, IsString, Length } from 'class-validator';


export class CreateOfferDto extends IntersectionType(
    BasicOfferDto
) {

    @ApiProperty({
        description : 'Subject ID',
        example     : 'MATH-101'
    })
    @IsString()
    @IsNotEmpty()
    @Length( 3, 10 )
    subjectId: string;

}
