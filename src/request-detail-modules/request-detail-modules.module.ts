import { Module } from '@nestjs/common';
import { RequestDetailModulesService } from './request-detail-modules.service';
import { RequestDetailModulesController } from './request-detail-modules.controller';

@Module({
  controllers: [RequestDetailModulesController],
  providers: [RequestDetailModulesService],
})
export class RequestDetailModulesModule {}
