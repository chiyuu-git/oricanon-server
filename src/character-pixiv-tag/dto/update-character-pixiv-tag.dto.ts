import { PartialType } from '@nestjs/swagger';
import { CreateCharacterPixivTagDto } from './create-character-pixiv-tag.dto';

export class UpdateCharacterPixivTagDto extends PartialType(CreateCharacterPixivTagDto) {}
