import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCharacterTagDto } from './create-character-tag.dto';

export class QueryCharacterTagDto extends PartialType(OmitType(CreateCharacterTagDto, ['tags'])) {}
