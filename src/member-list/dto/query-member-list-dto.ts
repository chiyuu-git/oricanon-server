import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateMemberListDto } from './create-member-list.dto';

export class QueryMemberListDto extends PartialType(OmitType(CreateMemberListDto, ['list'])) {}
