import { IsArray, IsString } from 'class-validator';
import { projectName, list, listType } from '../projects.type';

export class CreateProjectDto {
    @IsString()
    projectName: projectName;

    @IsString()
    listType: listType;

    @IsArray()
    list: list;
}
