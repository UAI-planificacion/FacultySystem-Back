import { Module } from '@nestjs/common';

import { SectionsService }		from '@sections/sections.service';
import { SectionsController }   from '@sections/sections.controller';
import { SpacesService }		from '@commons/services/spaces.service';


@Module({
	controllers	: [SectionsController],
	providers	: [SectionsService, SpacesService],
	exports		: [SectionsService],
})
export class SectionsModule {}
