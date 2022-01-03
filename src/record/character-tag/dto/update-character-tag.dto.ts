import { PartialType } from '@nestjs/swagger';
import { CreateProjectCharaRecordDto } from './create-character-tag.dto';

export class UpdateCharacterTagDto extends PartialType(CreateProjectCharaRecordDto) {}
