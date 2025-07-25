import { Injectable } from '@nestjs/common';

import { Observable, Subject } from 'rxjs';


@Injectable()
export class SseService {

    private eventSubject: Subject<any> = new Subject();

    emitEvent( data: any ): void {
        this.eventSubject.next( data );
    }

    getEvents(): Observable<any> {
        return this.eventSubject.asObservable();
    }

}
