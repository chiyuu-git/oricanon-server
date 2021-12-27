import { PartialType } from '@nestjs/swagger';
import { CreateMemberInfoDto } from './create-member-info.dto';

export class UpdateMemberInfoDto extends PartialType(CreateMemberInfoDto) {}
