import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCouplePixivTagDto } from './create-couple-pixiv-tag.dto';

export class QueryCouplePixivTagDto extends PartialType(OmitType(CreateCouplePixivTagDto, ['tags'])) {}
