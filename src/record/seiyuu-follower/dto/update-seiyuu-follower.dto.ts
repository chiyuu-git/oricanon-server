import { PartialType } from '@nestjs/swagger';
import { CreateProjectSeiyuuRecordDto } from './create-seiyuu-follower.dto';

export class UpdateSeiyuuFollowerDto extends PartialType(CreateProjectSeiyuuRecordDto) {}
