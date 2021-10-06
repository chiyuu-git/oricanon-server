import { IsArray, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { ProjectName, CoupleTagType } from '../couple-pixiv-tag.type';

export class CreateCouplePixivTagDto {
    // TODO: custom validator
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    type: CoupleTagType;

    @IsArray()
    tags: number[];
}
