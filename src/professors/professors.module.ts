import { Module } from '@nestjs/common';

import { ProfessorsService }    from '@professors/professors.service';
import { ProfessorsController } from '@professors/professors.controller';


@Module({
    controllers : [ProfessorsController],
    providers   : [ProfessorsService],
})
export class ProfessorsModule {}
