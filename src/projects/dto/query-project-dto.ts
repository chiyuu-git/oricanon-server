import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

export class QueryProjectDto extends PartialType(OmitType(CreateProjectDto, ['list'])) {}

export class FindProjectDto extends PartialType(OmitType(CreateProjectDto, ['list'])) {}
