import { PartialType } from '@nestjs/swagger';
import { CreateCoupleTagDto } from './create-couple-tag.dto';

export class UpdateCoupleTagDto extends PartialType(CreateCoupleTagDto) {}
