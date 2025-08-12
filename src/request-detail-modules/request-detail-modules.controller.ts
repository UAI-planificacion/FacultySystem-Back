import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequestDetailModulesService } from './request-detail-modules.service';
import { CreateRequestDetailModuleDto } from './dto/create-request-detail-module.dto';
import { UpdateRequestDetailModuleDto } from './dto/update-request-detail-module.dto';

@Controller('request-detail-modules')
export class RequestDetailModulesController {
  constructor(private readonly requestDetailModulesService: RequestDetailModulesService) {}

  @Post()
  create(@Body() createRequestDetailModuleDto: CreateRequestDetailModuleDto) {
    return this.requestDetailModulesService.create(createRequestDetailModuleDto);
  }

  @Get()
  findAll() {
    return this.requestDetailModulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestDetailModulesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequestDetailModuleDto: UpdateRequestDetailModuleDto) {
    return this.requestDetailModulesService.update(+id, updateRequestDetailModuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestDetailModulesService.remove(+id);
  }
}
