export enum EnumAction  {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}

export enum Type {
    REQUEST = 'request',
    DETAIL  = 'detail',
    TEST    = 'test'
}

export interface EmitEvent {
    message : any;
    action  : EnumAction;
    type    : Type;
    origin? : string | undefined;
}
