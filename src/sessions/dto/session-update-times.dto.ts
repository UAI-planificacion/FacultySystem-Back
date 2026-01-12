export type Difference = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | null | undefined;


export class Professor {
    id  : string;
    name: string;
}


export enum SessionType {
    C = 'C', // Cátedra
    A = 'A', // Ayudantía
    T = 'T', // Taller
    L = 'L'  // Laboratorio
}

export class OfferModule {
    id          : string;
    code        : string;
    name        : string;
    startHour   : string;
    endHour     : string;
    difference  : Difference;
}


export class SessionSec {
    id              : string;
    name            : SessionType;
    spaceId         : string | null;
    isEnglish       : boolean;
    chairsAvailable : number;
    professor       : Professor | null;
    module          : OfferModule;
    date            : Date;
    dayId           : number;
    dayModuleId     : number;
}


export class SectionSubject {
    id  : string;
    name: string;
}


export class SectionPeriod {
    id          : string;
    name        : string;
    startDate   : Date;
    endDate     : Date;
    openingDate : Date | null;
    closingDate : Date | null;
}

export class SectionSession {
    id          : string;
    code        : number;
    isClosed    : boolean;
    startDate   : Date;
    endDate     : Date;
    subject     : SectionSubject;
    period      : SectionPeriod;
    quota       : number;
    registered  : number;
    session     : SessionSec;
}