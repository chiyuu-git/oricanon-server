import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProjectSeiyuuRecordDto } from './create-seiyuu-follower.dto';

export class QuerySeiyuuFollowerDto extends PartialType(OmitType(CreateProjectSeiyuuRecordDto, ['records'])) {}
