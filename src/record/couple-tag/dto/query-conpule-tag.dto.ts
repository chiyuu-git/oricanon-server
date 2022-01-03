import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProjectCoupleRecordDto } from './create-couple-tag.dto';

export class QueryCoupleTagDto extends PartialType(OmitType(CreateProjectCoupleRecordDto, ['records'])) {}
