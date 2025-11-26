import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { $Enums } from "generated/prisma";


export class SectionSession {

    @ApiProperty({
        description : 'Unique identifier of the session.',
        example     : ['clx15746g000008l3f1z9h8y7'],
    })
    ids : string[];

    @ApiProperty({
        description : 'Unique identifier of the space.',
        example     : ['clx15746g000008l3f1z9h8y7'],
    })
    spaceIds: string[];

    @ApiProperty({
        description : 'Unique identifier of the day.',
        example     : [1],
    })
    dayIds: number[];

    @ApiProperty({
        description : 'Unique identifier of the module.',
        example     : [1],
    })
    moduleIds: number[];

    @ApiProperty({
        description : 'Unique identifier of the professor.',
        example     : ['clx15746g000008l3f1z9h8y7'],
    })
    professorIds: string[];

}


export class Module {

    @ApiProperty({
        description : 'Unique identifier of the module.',
        example     : 1,
    })
    id: number;


    @ApiProperty({
        description : 'Code of the module.',
        example     : 'MOD-A',
    })
    code: string;


    @ApiProperty({
        description : 'Start time of the module.',
        example     : '08:00',
    })
    startHour: string;


    @ApiProperty({
        description : 'End time of the module.',
        example     : '09:30',
    })
    endHour: string;


    @ApiPropertyOptional({
        description : 'Time difference or duration of the module.',
        example     : '1.5 hours',
    })
    difference: string | null;

}


export class Professor {

    @ApiProperty({
        description : 'Unique identifier of the professor.',
        example     : 'clx15746g000008l3f1z9h8y7',
    })
    id: string;


    @ApiProperty({
        description : 'Full name of the professor.',
        example     : 'Dr. Juan Pérez',
    })
    name: string;

}


export class Subject {

    @ApiProperty({
        description : 'Unique identifier of the subject.',
        example     : 'clx15746g000008l3f1z9h8y7',
    })
    id: string;


    @ApiProperty({
        description : 'Name of the subject.',
        example     : 'Programación Avanzada',
    })
    name: string;

}


export class Period {

    @ApiProperty({
        description : 'Unique identifier of the period.',
        example     : 1,
    })
    id: number;


    @ApiProperty({
        description : 'Name of the academic period.',
        example     : 'Otoño 2024',
    })
    name: string;

    @ApiProperty({
        description : 'Start date of the period.',
        example     : '2024-03-01T00:00:00.000Z',
    })
    startDate: Date;

    @ApiProperty({
        description : 'End date of the period.',
        example     : '2024-07-15T00:00:00.000Z',
    })
    endDate: Date;

    @ApiPropertyOptional({
        description : 'Opening date of the period.',
        example     : '2024-03-01T00:00:00.000Z',
    })
    openingDate: Date | null;

    @ApiPropertyOptional({
        description : 'Closing date of the period.',
        example     : '2024-07-15T00:00:00.000Z',
    })
    closingDate: Date | null;

}


export class SectionDto {

    @ApiProperty({
        description : 'Unique identifier of the section.',
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
        description : 'Start date of the section.',
        example     : '2024-03-01T00:00:00.000Z',
    })
    startDate : Date;


    @ApiProperty({
        description : 'End date of the section.',
        example     : '2024-07-15T00:00:00.000Z',
    })
    endDate : Date;


    @ApiProperty({
        description : 'Type of space required for the section (e.g., classroom, laboratory).',
        example     : 'ROOM',
        enum        : $Enums.SpaceType,
        nullable    : true,
    })
    spaceType : $Enums.SpaceType | null;


    @ApiProperty({
        description : 'Size of the space required for the section.',
        example     : 'MEDIUM',
        enum        : $Enums.SizeValue,
        nullable    : true,
    })
    spaceSizeId: $Enums.SizeValue | null;


    @ApiProperty({
        description : 'Number of workshop sessions for the section.',
        example     : 2,
    })
    workshop    : number;


    @ApiProperty({
        description : 'Number of lecture sessions for the section.',
        example     : 3,
    })
    lecture     : number;


    @ApiProperty({
        description : 'Number of tutoring sessions for the section.',
        example     : 1,
    })
    tutoringSession : number;


    @ApiProperty({
        description : 'Number of laboratory sessions for the section.',
        example     : 2,
    })
    laboratory  : number;


    @ApiProperty({
        description : 'Unique identifier of the group associated with the section.',
        example     : 'clx15746g000008l3f1z9h8y7',
    })
    groupId: string;


    @ApiProperty({
        description : 'Professor assigned to the section.',
        example     : { id: 'clx15746g000008l3f1z9h8y7', name: 'Dr. Juan Pérez' },
        nullable    : true,
        type        : () => Professor,
    })
    professor: Professor | null;


    @ApiProperty({
        description : 'Subject of the section.',
        example     : { id: 'clx15746g000008l3f1z9h8y7', name: 'Programación Avanzada' },
        type        : () => Subject,
    })
    subject: Subject;


    @ApiProperty({
        description : 'Academic period of the section.',
        example     : { id: 1, name: 'Otoño 2024' },
        type        : () => Period,
    })
    period: Period;


    @ApiPropertyOptional({
        description : 'Building where the section takes place.',
        example     : 'BUILDING_A',
        enum        : $Enums.Building,
    })
    building?: $Enums.Building;


    @ApiPropertyOptional({
        description : 'Total number of sessions in the section.',
        example     : 58,
    })
    sessionsCount : number;


    @ApiPropertyOptional({
        description : 'Indicates if the section has a pending request.',
        example     : true,
    })
    haveRequest: boolean;


    @ApiPropertyOptional({
        description : 'Number of quota students in the section.',
        example     : 20,
    })
    quota: number


    @ApiPropertyOptional({
        description : 'Number of quota students in the section.',
        example     : 20,
    })
    registered: number;


    @ApiPropertyOptional({
        description : 'Session details including spaces, days, modules and professors.',
        example     : {
            ids         : [ 'clx15746g000008l3f1z9h8y7' ],
            spaceIds    : [ 'clx15746g000008l3f1z9h8y7' ],
            dayIds      : [ 1 ],
            moduleIds   : [ 1 ],
            professorIds: [ 'clx15746g000008l3f1z9h8y7' ],
        },
        type        : () => SectionSession,
    })
    sessions : SectionSession;

}
