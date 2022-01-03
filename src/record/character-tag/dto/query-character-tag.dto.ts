import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProjectCharaRecordDto } from './create-character-tag.dto';

export class QueryCharacterTagDto extends PartialType(OmitType(CreateProjectCharaRecordDto, ['records'])) {}
