import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { FacultiesModule } from './faculties/faculties.module';
import { StaffModule } from './staff/staff.module';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
    imports     : [FacultiesModule, StaffModule, SubjectsModule],
    controllers : [AppController],
    providers   : [],
})
export class AppModule {}
