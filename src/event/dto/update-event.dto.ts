import { PartialType } from '@nestjs/swagger';
import { CreateGroupEventDto } from './create-event.dto';

export class UpdateGroupEventDto extends PartialType(CreateGroupEventDto) {}
