import { PartialType } from '@nestjs/swagger';

import { CreateProfessorDto } from '@professors/dto/create-professor.dto';


export class UpdateProfessorDto extends PartialType( CreateProfessorDto ) {}
