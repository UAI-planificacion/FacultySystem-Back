import { Module }                           from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ENV } from '@config/envs';


@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            load: [ENV],
            cache: true,
        }),
    ],
    exports: [NestConfigModule],
})
export class ConfigModule {}
