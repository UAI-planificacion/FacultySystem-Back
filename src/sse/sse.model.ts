export enum EnumAction  {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}


export enum Type {
    REQUEST         = 'request',
    REQUEST_SESSION = 'request_session',
    TEST            = 'test',
    COMMENT         = 'comment'
}


export interface EmitEvent {
    message : any;
    action  : EnumAction;
    type    : Type;
    origin? : string | undefined;
}
