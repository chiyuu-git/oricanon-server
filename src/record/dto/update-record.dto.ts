import { PartialType } from '@nestjs/swagger';
import { CreateRecordDto } from './create-record.dto';

export class UpdateMemberInfoDto extends PartialType(CreateRecordDto) {}
