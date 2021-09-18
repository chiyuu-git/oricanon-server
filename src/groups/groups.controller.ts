import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';
import { groupName } from './groups.type';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupsService: GroupsService) {}

	@Post()
	create(@Body() createGroupDto: CreateGroupDto) {
		return this.groupsService.create(createGroupDto);
	}

	@Get()
	findAll() {
		return this.groupsService.findAll();
	}

	@Get(':groupName')
	@ApiParam({ name: 'groupName', enum: groupName })
	findOne(@Param('groupName') groupName: groupName) {
		return this.groupsService.findOne(groupName);
	}

	@Patch(':groupName')
	@ApiParam({ name: 'groupName', enum: groupName })
	update(
		@Param('groupName') groupName: groupName,
		@Body() updateGroupDto: UpdateGroupDto,
	) {
		return this.groupsService.update(groupName, updateGroupDto);
	}

	@Delete(':groupName')
	remove(@Param('groupName') groupName: groupName) {
		return this.groupsService.remove(groupName);
	}
}
