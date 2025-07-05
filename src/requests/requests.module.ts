import { Module } from '@nestjs/common';

import { RequestsService }    from '@requests/requests.service';
import { RequestsController } from '@requests/requests.controller';

@Module({
    controllers : [RequestsController],
    providers   : [RequestsService],
})
export class RequestsModule {}
