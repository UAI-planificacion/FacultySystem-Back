// Interface for Excel row data
interface ExcelSectionRow {
    PeriodoAcademicoId: string;
    CodigoOmega: string;
    Sigla: string;
    NombreAsignatura: string;
    "Sec.": number;
    CupoSeccion: number;
    Sala: string;
    Capacidad: number;
    Tipo: string;
    Size: string;
    Talla: string;
    Inscritos: number;
    InscritosOriginal: number;
    PROF: string;
    ProfesorId: string | null;
    Dia: number;
    Modulo: number;
    Diff: string | null;
    Edificio: string;
    FechaInicio: string;
    TipoPeriodo: string;
    Horario: string;
    SSEC: string;
    TallaMinimaInscritos: string;
    TallaMinima: string;
    SillasDisp: number;
    InformacionAdicional: string;
    COD: string;
}
