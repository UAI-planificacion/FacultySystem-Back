import { Module } from '@nestjs/common';

import { SizesService }     from '@sizes/sizes.service';
import { SizesController }  from '@sizes/sizes.controller';


@Module({
    controllers : [SizesController],
    providers   : [SizesService],
})
export class SizesModule {}
