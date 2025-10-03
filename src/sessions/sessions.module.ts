import { Module } from '@nestjs/common';

import { SessionsService }    from '@sessions/sessions.service';
import { SessionsController } from '@sessions/sessions.controller';
import { SectionsModule }     from '@sections/sections.module';


@Module({
	imports		: [SectionsModule],
	controllers	: [SessionsController],
	providers	: [SessionsService],
})
export class SessionsModule {}
