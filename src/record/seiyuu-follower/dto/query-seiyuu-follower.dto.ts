import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSeiyuuFollowerDto } from './create-seiyuu-follower.dto';

export class QuerySeiyuuFollowerDto extends PartialType(OmitType(CreateSeiyuuFollowerDto, ['records'])) {}
