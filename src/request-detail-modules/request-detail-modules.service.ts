import { Injectable } from '@nestjs/common';
import { CreateRequestDetailModuleDto } from './dto/create-request-detail-module.dto';
import { UpdateRequestDetailModuleDto } from './dto/update-request-detail-module.dto';

@Injectable()
export class RequestDetailModulesService {
  create(createRequestDetailModuleDto: CreateRequestDetailModuleDto) {
    return 'This action adds a new requestDetailModule';
  }

  findAll() {
    return `This action returns all requestDetailModules`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requestDetailModule`;
  }

  update(id: number, updateRequestDetailModuleDto: UpdateRequestDetailModuleDto) {
    return `This action updates a #${id} requestDetailModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} requestDetailModule`;
  }
}
