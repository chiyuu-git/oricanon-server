import { IsArray, IsString } from 'class-validator';
import { ProjectName, BasicType } from '@chiyu-bit/canon.root';
import { List } from '../member-list.type';

export class CreateMemberListDto {
    @IsString()
    projectName: ProjectName;

    @IsString()
    type: BasicType;

    @IsArray()
    list: List;
}
