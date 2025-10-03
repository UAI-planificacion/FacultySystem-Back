import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { $Enums } from "generated/prisma";


export class Session {
    @ApiProperty({
        description : 'The period of the day for the section.',
        example     : '10:00 AM',
    })
    id: string;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    name: string;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    spaceId: string;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    isEnglish: boolean;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    chairsAvailable: number;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    correctedRegistrants: number;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    realRegistrants: number;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    plannedBuilding: string;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    module: Module;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    dayId: number;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 1,
    })
    dayModuleId : number;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    professor: Professor;


    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    date: Date;
}


export class Module {

    @ApiProperty({
        description : 'The period of the day for the section.',
        example     : '10:00 AM',
    })
    id: number;


    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    code: string;


    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    startHour: string;


    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    endHour: string;


    @ApiPropertyOptional({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    difference: string | null;

}


export class Professor {
    @ApiProperty({
        description : 'The period of the day for the section.',
        example     : '10:00 AM',
    })
    id: string;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    name: string;
}


export class Subject {
    @ApiProperty({
        description : 'The period of the day for the section.',
        example     : '10:00 AM',
    })
    id: string;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    name: string;
}


export class Period {
    @ApiProperty({
        description : 'The period of the day for the section.',
        example     : '10:00 AM',
    })
    id: number;

    @ApiProperty({
        description : 'The day of the week for the section.',
        example     : 'Monday',
    })
    name: string;
}

export class SectionDto {

    @ApiProperty({
        description : 'The unique identifier of the section.',
        example     : 'clx15746g000008l3f1z9h8y7',
    })
    id: string;

    @ApiProperty({
        description : 'Indicates if the section is closed.',
        example     : true,
    })
    isClosed: boolean;

    @ApiProperty({
        description : 'The code of the section.',
        example     : 101,
    })
    code: number;

    @ApiProperty({
        description : 'The start date of the section.',
        example     : '2024-01-01',
    })
    startDate : Date;

    @ApiProperty({
        description : 'The end date of the section.',
        example     : '2024-01-01',
    })
    endDate : Date;

    @ApiProperty({
        description : 'The type of space for the section.',
        example     : 'ROOM',
        enum        : $Enums.SpaceType,
        nullable    : true,
    })
    spaceType : $Enums.SpaceType | null;

    @ApiProperty({
        description : 'The size of the section.',
        example     : 'MEDIUM',
        enum        : $Enums.SizeValue,
        nullable    : true,
    })
    spaceSizeId: $Enums.SizeValue | null;

    @ApiProperty({
        description : 'The number of workshop for the section.',
        example     : 1,
    })
    workshop    : number;

    @ApiProperty({
        description : 'The number of lecture for the section.',
        example     : 1,
    })
    lecture     : number;

    @ApiProperty({
        description : 'The number of tutoring session for the section.',
        example     : 1,
    })
    tutoringSession : number;

    @ApiProperty({
        description : 'The number of laboratory for the section.',
        example     : 1,
    })
    laboratory  : number;

    @ApiProperty({
        description : 'The ID of the group for the section.',
        example     : 'clx15746g000008l3f1z9h8y7',
    })
    groupId: string;

    @ApiProperty({
        description : 'The name of the period for the section.',
        example     : 'Fall 2024',
    })
    professor: Professor | null;

    @ApiProperty({
        description : 'The name of the period for the section.',
        example     : 'Fall 2024',
    })
    subject: Subject;

    @ApiProperty({
        description : 'The name of the period for the section.',
        example     : 'Fall 2024',
    })
    period: Period;

    @ApiProperty({
        description : 'The name of the period for the section.',
        example     : 'Fall 2024',
    })
    sessions: Session[];

}
