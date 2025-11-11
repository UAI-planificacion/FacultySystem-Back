export class ExcelSessionDto {
    SSEC            : string;
    SesionId        : string;
    Numero          : number;
    NombreAsignatura: string;
    Dia             : number;
    Modulo          : string;
    Periodo         : string;
    TipoPeriodo     : string;
    Edificio        : string | null;
    TipoEspacio     : string | null;
    TamanoEspacio   : string | null;
    TipoSesion      : string;
    Cupos           : number;
    Profesor        : string | null;
    Espacio         : string | null;
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


type Status = 'Available' | 'Unavailable' | 'Probable';


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
