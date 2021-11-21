import { AggregationType, ProjectName, RecordType } from '@chiyu-bit/canon.root';
import { Transform } from 'class-transformer';
import { IsDateString, IsString } from 'class-validator';
import { formatDate } from 'src/utils';

export class QueryRangeRecordDto {
    // TODO: custom validator
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    from: string;

    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    to: string;

    @IsString()
    recordType: RecordType;

    @IsString()
    projectName: ProjectName;
}

export class QueryOneRecordDto {
    @IsString()
    projectName: ProjectName;

    @IsString()
    date: string;

    @IsString()
    recordType: RecordType;
}

export class QueryOneAggtRecordDto {
    @IsString()
    projectName: ProjectName;

    @IsString()
    date: string;

    @IsString()
    aggregationType?: AggregationType;
}
