import { BasicType, ProjectName } from '@common/root';
import { RecordType } from '@common/record';
import { Transform } from 'class-transformer';
import { IsDateString, IsString } from 'class-validator';
import { formatDate } from 'src/utils';

/**
 * basicType、date、projectName、recordType 可以从数据库所有表中查找到唯一的 projectRecord
 */
export class QueryOneProjectRecordInDB {
    @IsString()
    basicType: BasicType;

    @IsString()
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    recordType: RecordType;
}

/**
 * 在某个基础类别下，查询单个 projectRecord 需要 date、projectName、recordType 三个参数
 */
export class QueryOneProjectRecord {
    @IsString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    recordType: RecordType;
}

export class QueryRangeProjectRecordOfTypeDto {
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
