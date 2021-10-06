import { PartialType } from '@nestjs/swagger';
import { CreateCouplePixivTagDto } from './create-couple-pixiv-tag.dto';

export class UpdateCouplePixivTagDto extends PartialType(CreateCouplePixivTagDto) {}
