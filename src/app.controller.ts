import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {}

    @Get()
    getHello(): string {
        return 'Bienvenido al Sistema de Facultad Académica Backend';
    }
}
