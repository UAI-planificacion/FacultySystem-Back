import { Type } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class SectionQuery {

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    onlyWithSessions?: boolean;

}