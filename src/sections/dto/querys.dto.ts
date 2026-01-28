import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class SectionQuery {

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    onlyWithSessions?: boolean;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    canConsecutiveId?: boolean;

    @IsString()
    @IsOptional()
    @Type( () => String )
    @Length( 1, 10 )
    periodId?: string;

}
