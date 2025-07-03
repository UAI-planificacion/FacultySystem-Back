import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateFacultyDto {

    @ApiProperty({
        description: 'The name of the faculty.',
        example: 'Faculty of Computer Science',
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 100, {
        message: 'Name must be between 3 and 100 characters',
    })
    name: string;

    @ApiProperty({
        description: 'The description of the faculty.',
        example: 'Faculty of Computer Science',
    })
    @IsString()
    @IsOptional()
    @Length(0, 255, {
        message: 'Description must be between 0 and 255 characters',
    })
    description?: string;

}
