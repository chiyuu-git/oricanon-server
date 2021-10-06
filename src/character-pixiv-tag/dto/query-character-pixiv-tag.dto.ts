import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCharacterPixivTagDto } from './create-character-pixiv-tag.dto';

export class QueryCharacterPixivTagDto extends PartialType(OmitType(CreateCharacterPixivTagDto, ['tags'])) {}
