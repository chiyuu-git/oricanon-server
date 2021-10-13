import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCoupleTagDto } from './create-couple-tag.dto';

export class QueryCoupleTagDto extends PartialType(OmitType(CreateCoupleTagDto, ['records'])) {}
