class BaseFaculty {
    totalSubjects   : number;
    totalStaff      : number;
    totalRequests   : number;
    totalOffers     : number;
}


export class FacultyResponse extends BaseFaculty {
    faculties       : Faculty[];
}


export class Faculty extends BaseFaculty {
    id              : string;
    name            : string;
    description?    : string | null;
    isActive        : boolean;
    createdAt       : Date;
    updatedAt       : Date;
}
