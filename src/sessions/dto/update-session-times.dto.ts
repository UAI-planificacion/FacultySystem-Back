import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';


export class UpdateMultipleSessionTimesDto {

    @ApiProperty({
        type        : String,
        description : 'ID de la sesión',
        example     : '1'
    })
    @IsNotEmpty({ message: 'El sessionId es requerido' })
    @IsString({ message: 'El sessionId debe ser un string' })
    @Length(1, 50, { message: 'El sessionId debe tener entre 1 y 50 caracteres' })
    sessionId: string;


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
