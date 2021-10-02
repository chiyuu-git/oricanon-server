import { IsArray, IsDateString, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { formatDate } from 'src/utils';
import { ProjectName, CoupleTagType } from '../couple-pixiv-tags.type';

export class CreateCouplePixivTagDto {
    // TODO: custom validator
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    @Type(() => Date)
    date: Date;

    @IsString()
    projectName: ProjectName;

    @IsString()
    type: CoupleTagType;

    @IsArray()
    tags: number[];
}
