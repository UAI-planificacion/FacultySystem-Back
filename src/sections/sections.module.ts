import { Module } from '@nestjs/common';

import { SectionsService }		from '@sections/sections.service';
import { SectionsController }   from '@sections/sections.controller';


@Module({
	controllers	: [SectionsController],
	providers	: [SectionsService],
})
export class SectionsModule {}
