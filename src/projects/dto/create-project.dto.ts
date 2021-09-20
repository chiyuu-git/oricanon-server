import { IsArray, IsString } from 'class-validator';
import { ProjectName, List, ListType } from '../projects.type';

export class CreateProjectDto {
    @IsString()
    projectName: ProjectName;

    @IsString()
    listType: ListType;

    @IsArray()
    list: List;
}
