import { Response } from 'express';

import {
    Controller,
    Get,
    Post,
    Res,
} from '@nestjs/common';

import { SseService } from '@sse/sse.service';


@Controller( 'sse' )
export class SseController {

    constructor(
        private readonly sseService: SseService
    ) {}

    @Get()
    subscribe( @Res() res: Response ): void {
        res.setHeader( 'Content-Type', 'text/event-stream' );
        res.setHeader( 'Cache-Control', 'no-cache' );
        res.setHeader( 'Connection', 'keep-alive' );
        res.flushHeaders();

        const observable    = this.sseService.getEvents();
        const subscription  = observable.subscribe(( event ) => {
            res.write( `data: ${JSON.stringify( event )}\n\n` );
        });

        res.on( 'close', () => {
            subscription.unsubscribe();
            res.end();
        });
    }

    emitEvent( data: any ): void {
        this.sseService.emitEvent( data );
    }

    @Post( 'emit' )
    emitExampleEvent(): void {
        const data = { message: 'Este es un evento SSE' };
        this.sseService.emitEvent( data );
    }

}
