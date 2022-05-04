import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Category, ProjectName } from '@common/root';
import { RecordType } from '@common/record';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

abstract class QueryRecordDto {
    @IsString()
    category: Category;

    @IsString()
    @ApiProperty({
        // swagger 不清楚联合类型 RecordType 的基础类型是啥，所以需要显式声明
        type: String,
        default: 'pixiv_illust',
    })
    recordType: RecordType;
}

export class QueryRecordInRangeDto extends QueryRecordDto {
    // TODO: custom validator
    @IsString()
    from: string;

    @IsString()
    @IsOptional()
    to?: string;
}

export class QueryHistoricalWeekIncrementOfPercentileDto extends QueryRecordInRangeDto {
    @IsNumber()
    @Transform(({ value }) => Number.parseInt(value, 10))
    percentile: number;
}

export class QueryProjectRecordInRangeDto extends QueryRecordInRangeDto {
    @IsString()
    projectName: ProjectName;
}

export class QueryMemberRecordInRangeDto extends QueryRecordInRangeDto {
    @IsString()
    romaName: string;
}

export class QueryProjectRelativeIncrementInfoDto {
    @IsString()
    category: Category;

    @IsString()
    projectName: ProjectName;

    @IsString()
    from: string;

    @IsString()
    @IsOptional()
    to?: string;
}
