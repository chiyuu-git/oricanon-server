import { PartialType } from '@nestjs/swagger';
import { CreateCharacterTagDto } from './create-character-tag.dto';

export class UpdateCharacterTagDto extends PartialType(CreateCharacterTagDto) {}
