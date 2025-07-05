import { Module } from '@nestjs/common';
import { RequestsModule } from './requests/requests.module';
import { RequestDetailsModule } from './request-details/request-details.module';
import { ProfessorsModule } from './professors/professors.module';

import { AppController }    from '@app/app.controller';
import { FacultiesModule }  from '@faculties/faculties.module';
import { StaffModule }      from '@staff/staff.module';
import { SubjectsModule }   from '@subjects/subjects.module';
import { ConfigModule }     from '@config/config.module';


@Module({
    imports     : [
        FacultiesModule,
        StaffModule,
        SubjectsModule,
        ConfigModule,
        RequestsModule,
        RequestDetailsModule,
        ProfessorsModule
    ],
    controllers : [AppController],
    providers   : [],
})
export class AppModule {}
