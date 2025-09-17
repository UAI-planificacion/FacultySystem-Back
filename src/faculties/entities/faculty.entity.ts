export class FacultyResponse {
    totalSubjects   : number;
    totalPersonnel  : number;
    totalRequests   : number;
    totalOffers     : number;
    faculties       : Faculty[];
}


export class Faculty {
    id              : string;
    name            : string;
    description?    : string | null;
    isActive        : boolean;
    totalSubjects   : number;
    totalPersonnel  : number;
    totalRequests   : number;
    totalOffers     : number;
    createdAt       : Date;
    updatedAt       : Date;
}
