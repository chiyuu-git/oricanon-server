import { IsArray, IsString } from 'class-validator';
import { ProjectName, List, ListType } from '../member-lists.type';

export class CreateMemberListDto {
    @IsString()
    projectName: ProjectName;

    @IsString()
    type: ListType;

    @IsArray()
    list: List;
}
