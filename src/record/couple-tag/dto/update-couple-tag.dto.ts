import { PartialType } from '@nestjs/swagger';
import { CreateProjectCoupleRecordDto } from './create-couple-tag.dto';

export class UpdateCoupleTagDto extends PartialType(CreateProjectCoupleRecordDto) {}
