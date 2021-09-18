/*
  create-cat.dto.ts
*/
import { IsArray, IsString } from 'class-validator';
import { groupName } from '../groups.type';

export class CreateGroupDto {
	@IsString()
	groupName: groupName;

	@IsArray()
	members: string[];
}
