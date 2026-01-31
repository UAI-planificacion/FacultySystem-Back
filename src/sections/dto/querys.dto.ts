import { Transform, Type } from "class-transformer";
import { ArrayMinSize, ArrayMaxSize, IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class SectionQuery {

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    onlyWithSessions?: boolean;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    canConsecutiveId?: boolean;

    @IsString({ each: true })
    @IsOptional()
    @Transform(({ value }) => {
        // Si viene como string separado por comas, convertirlo a array
        if (typeof value === 'string') {
            return value.split(',').map(id => id.trim()).filter(id => id.length > 0);
        }
        // Si ya es un array, devolverlo tal cual
        if (Array.isArray(value)) {
            return value;
        }
        // Si es undefined o null, devolver undefined
        return value;
    })
    @ArrayMinSize( 1 )
    @ArrayMaxSize( 10 )
    @Length( 1, 10, { each: true } )
    periodIds?: string[];

}
