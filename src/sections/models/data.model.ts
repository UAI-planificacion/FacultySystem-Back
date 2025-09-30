import { $Enums } from "generated/prisma";

export interface RoomData {
    id: string;
    capacity: number;
    building: string;
    sizeValue: $Enums.SizeValue;
    spaceType: $Enums.SpaceType;
}


export interface ProfessorData {
    id: string;
    name: string;
}


export interface SubjectData {
    id: string;
    name: string;
    startDate: Date;
}


export interface PeriodData {
    id: string;
    name: string;
}


export interface Section {
    id                      : string;
    code                    : number;
    // session                 : $Enums.Session;
    size                    : $Enums.SizeValue;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    chairsAvailable         : number;
    roomId                  : string;
    dayModuleId             : number;
    professorId             : string | null;
    groupId                 : string;
}


export interface SubjectSection {
    sectionId   : string;
    subjectId   : string;
    periodId    : string;
}