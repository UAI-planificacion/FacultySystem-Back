
// type Status = 'Available' | 'Unavailable' | 'Probable';

export interface AssignmentDto {
    type : Type;
    data : ExcelSessionDto[]
}


export interface ExcelSessionDto {
    SSEC                : string;
    SesionId            : string;
    SectionId?          : string;
    Numero              : number;
    NombreAsignatura    : string;
    Fecha               : Date;
    Dia                 : number;
    Modulo              : string;
    Periodo             : string;
    TipoPeriodo         : string;
    Edificio            : string | null;
    TipoEspacio         : string | null;
    TamanoEspacio       : string | null;
    TamanoDetalle       : string | null;
    TipoSesion          : string;
    Cupos               : number;
    Inscritos?          : number | null;
    InscritosActuales?   : number | null;
    Profesor            : string | null;
    ProfesorActual?     : string | null;
    Espacio             : string | null;
    EspacioActual?      : string | null;
    SillasDisponibles?  : number | null;
    Estado?             : Status;
    Detalle?            : string;
}


export interface ExcelSectionDto {
    SectionId           : string;
    SSEC                : string;
    NombreAsignatura    : string;
    Periodo             : string;
    TipoPeriodo         : string;
    Edificio            : string;
    TipoEspacio         : string;
    TamanoEspacio       : string;
    Cupos               : string;
    Inscritos           : string;
}


export interface Professor {
    id      : string;
    name    : string;
}


export class SessionDataDto {
    sessionId   : string;
    spaceId?    : string;       // Solo si type === 'space'
    professor?  : Professor;    // Solo si type === 'professor'
}


export class SectionDataDto {
    sectionId   : string;
    registered  : number;
}


export enum Type {
    SPACE       = 'space',
    PROFESSOR   = 'professor',
    REGISTERED  = 'registered'
}




export interface SessionAvailabilityResult {
    SSEC        : string;
    session     : string;
    date        : Date;
    module      : string;
    spaceId?    : string;
    professor?  : Professor;
    status      : Status;
    detalle     : string;
    sessionId   : string;
}


export enum Status {
    AVAILABLE   = 'Available',
    UNAVAILABLE = 'Unavailable',
    PROBABLE    = 'Probable'
}