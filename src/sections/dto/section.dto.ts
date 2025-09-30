import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { $Enums } from "generated/prisma";


export class Day {
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


    // @ApiProperty({
    //     description : 'The session of the section.',
    //     example     : 'A1',
    //     nullable    : true,
    // })
    // session: $Enums.Session | null;


    @ApiProperty({
        description : 'The size of the section.',
        example     : 'MEDIUM',
        enum        : $Enums.SizeValue,
        nullable    : true,
    })
    size: $Enums.SizeValue | null;


    @ApiProperty({
        description : 'The number of corrected registrants for the section.',
        example     : 25,
        nullable    : true,
    })
    correctedRegistrants: number | null;


    @ApiProperty({
        description : 'The number of real registrants for the section.',
        example     : 30,
        nullable    : true,
    })
    realRegistrants: number | null;


    @ApiProperty({
        description : 'The planned building for the section.',
        example     : 'Main Building',
        nullable    : true,
    })
    plannedBuilding: string | null;


    @ApiProperty({
        description : 'The number of chairs available for the section.',
        example     : 30,
        nullable    : true,
    })
    chairsAvailable: number | null;


    @ApiProperty({
        description : 'The room where the section is held.',
        example     : 'Room 101',
        nullable    : true,
    })
    room: string | null;


    // @ApiProperty({
    //     description : 'The professor teaching the section.',
    //     example     : 'Dr. Smith',
    //     nullable    : true,
    // })
    // professorName: string | null;


    // @ApiProperty({
    //     description : 'The ID of the professor teaching the section.',
    //     example     : 'clx15746g000008l3f1z9h8y7',
    //     nullable    : true,
    // })
    // professorId: string | null;


    // @ApiProperty({
    //     description : 'The ID of the day module for the section.',
    //     example     : 1,
    //     nullable    : true,
    // })
    // day: number | null;


    // @ApiProperty({
    //     description : 'The ID of the day module for the section.',
    //     example     : "1",
    //     nullable    : true,
    // })
    // moduleId: string | null;


    // @ApiProperty({
    //     description : 'The name of the subject for the section.',
    //     example     : 'Introduction to Programming',
    //     nullable    : true,
    // })
    // subjectName: string | null;


    // @ApiProperty({
    //     description : 'The ID of the subject for the section.',
    //     example     : 'CS101',
    //     nullable    : true,
    // })
    // subjectId: string | null;


    // @ApiProperty({
    //     description : 'The name of the period for the section.',
    //     example     : 'Fall 2024',
    // })
    // period: string;

    @ApiProperty({
        description : 'The ID of the group for the section.',
        example     : 'clx15746g000008l3f1z9h8y7',
    })
    groupId: string;


    @ApiProperty({
        description : 'The name of the period for the section.',
        example     : 'Fall 2024',
    })
    day: Day | null;


    @ApiProperty({
        description : 'The name of the period for the section.',
        example     : 'Fall 2024',
    })
    module: Module | null;


    @ApiProperty({
        description : 'The name of the period for the section.',
        example     : 'Fall 2024',
    })
    professor: Professor | null;


    @ApiProperty({
        description : 'The name of the period for the section.',
        example     : 'Fall 2024',
    })
    subject: Subject | null;


    @ApiProperty({
        description : 'The name of the period for the section.',
        example     : 'Fall 2024',
    })
    period: Period | null;

}
