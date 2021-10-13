import { PartialType } from '@nestjs/swagger';
import { CreateSeiyuuFollowerDto } from './create-seiyuu-follower.dto';

export class UpdateSeiyuuFollowerDto extends PartialType(CreateSeiyuuFollowerDto) {}
