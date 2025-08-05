import { Injectable } from '@nestjs/common';

import { Observable, Subject } from 'rxjs';

import { EmitEvent } from '@sse/sse.model';


@Injectable()
export class SseService {

    private eventSubject: Subject<EmitEvent> = new Subject();

    emitEvent( emitEvent: EmitEvent ): void {
        this.eventSubject.next( emitEvent );
    }

    getEvents(): Observable<EmitEvent> {
        return this.eventSubject.asObservable();
    }

}
