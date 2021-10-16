import { IsArray, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { ProjectName } from '../seiyuu-follower.type';

export class CreateSeiyuuFollowerDto {
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsArray()
    @Transform(({ value }) => JSON.parse(value))
    records: number[];
}

