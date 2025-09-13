import { Module } from '@nestjs/common';

import { AppController }        from '@app/app.controller';
import { FacultiesModule }      from '@faculties/faculties.module';
import { StaffModule }          from '@staff/staff.module';
import { SubjectsModule }       from '@subjects/subjects.module';
import { ConfigModule }         from '@config/config.module';
import { RequestsModule }       from '@requests/requests.module';
import { RequestDetailsModule } from '@request-details/request-details.module';
import { OffersModule }         from '@offers/offers.module';
import { GradesModule }         from '@grades/grades.module';
import { SseModule }            from '@sse/sse.module';
import { CommentsModule }       from '@comments/comments.module';


@Module({
    imports: [
        FacultiesModule,
        StaffModule,
        SubjectsModule,
        ConfigModule,
        RequestsModule,
        RequestDetailsModule,
        SseModule,
        CommentsModule,
        GradesModule,
        OffersModule,
    ],
    controllers : [ AppController ],
    providers   : [],
})
export class AppModule {}
