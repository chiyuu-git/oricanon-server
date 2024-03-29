import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from '@utils/date';
import { GroupName } from '@common/member-info';
import { EventTypeEnum } from '@common/event-list';
import { transformToArray } from '@utils/transform';

export class CreateEventRecordDto {
    @IsString()
    type: EventTypeEnum;

    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    from: string;

    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    to: string;

    /**
     * 包含 groupName，使用动宾短语描述即可
     */
    @IsString()
    title: string;

    /**
     * 可包含 groupName，描述尽量完善
     */
    @IsString()
    @IsOptional()
    content?: string;

    /**
     * 相关内容的链接：推文、官网、新闻等
     */
    @IsArray()
    @Transform(transformToArray)
    @IsOptional()
    relativeUrlList?: string[];

    /**
     * 备注
     */
    @IsString()
    @IsOptional()
    remark?: string;

    /**
     * 覆盖 eventType 默认的优先级
     */
    @IsNumber()
    @Transform(({ value }) => +value)
    @IsOptional()
    overridePriority?: number;
}

export class CreateGroupEventDto extends CreateEventRecordDto {
    @IsArray()
    @Transform(transformToArray)
    groupList: GroupName[];
}

export class CreateSoloEventDto extends CreateEventRecordDto {
    /**
     * member roma name
     */
    @IsString()
    romaName: string;
}

