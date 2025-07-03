import { Module } from '@nestjs/common';

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
        ConfigModule
    ],
    controllers : [AppController],
    providers   : [],
})
export class AppModule {}
