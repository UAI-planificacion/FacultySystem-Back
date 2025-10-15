import { Module } from '@nestjs/common';

import { SessionsService }    from '@sessions/sessions.service';
import { SessionsController } from '@sessions/sessions.controller';
import { SectionsModule }     from '@sections/sections.module';
import { SpacesService }      from '@commons/services/spaces.service';


@Module({
	imports		: [SectionsModule],
	controllers	: [SessionsController],
	providers	: [SessionsService, SpacesService],
})
export class SessionsModule {}
