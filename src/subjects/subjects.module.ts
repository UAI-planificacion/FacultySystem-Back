import { Module } from '@nestjs/common';

import { SubjectsService }      from '@subjects/subjects.service';
import { SubjectsController }   from '@subjects/subjects.controller';


@Module({
    controllers : [SubjectsController],
    providers   : [SubjectsService],
})
export class SubjectsModule {}
