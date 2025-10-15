import { $Enums } from "generated/prisma";


export class CalculateAvailabilityDto {

    session: $Enums.SessionName;

    // Uno de los 2
    building?: $Enums.Building;
    spaceIds?: string[];

    // Uno de los 2
    spaceType?: $Enums.SpaceType;
    spaceSizeId?: $Enums.SizeValue;

    professorIds?: string[];

    dayModuleIds: number[];

}
