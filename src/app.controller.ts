import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {}

    @Get()
    getHello(): string {
        return 'Bienvenido al Sistema Académico de la Universidad Adolfo Ibañez';
    }
}
