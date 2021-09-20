import { OmitType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

export class QueryProjectDto extends OmitType(CreateProjectDto, ['list']) {}
