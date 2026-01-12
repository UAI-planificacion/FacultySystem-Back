import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';


export class UpdateSessionTimesDto {

    @ApiProperty({
        type        : String,
        description : 'ID del espacio a asignar',
        example     : 'A101'
    })
    @IsNotEmpty({ message: 'El spaceId es requerido' })
    @IsString({ message: 'El spaceId debe ser un string' })
    @Length(1, 50, { message: 'El spaceId debe tener entre 1 y 50 caracteres' })
    spaceId: string;


    @ApiProperty({
        type        : Number,
        description : 'ID del day-module (día y módulo horario)',
        example     : 1,
        minimum     : 1
    })
    @IsNotEmpty({ message: 'El dayModuleId es requerido' })
    @IsInt({ message: 'El dayModuleId debe ser un número entero' })
    @Min(1, { message: 'El dayModuleId debe ser mayor a 0' })
    @Max(100000, { message: 'El dayModuleId no puede exceder 100000' })
    @Transform(({ value }) => parseInt(value))
    dayModuleId: number;

}
