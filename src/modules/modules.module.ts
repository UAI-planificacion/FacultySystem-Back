import { Module } from '@nestjs/common';

import { ModulesService }       from '@modules/modules.service';
import { ModulesController }    from '@modules/modules.controller';


@Module({
    controllers : [ModulesController],
    providers   : [ModulesService],
})
export class ModulesModule {}
