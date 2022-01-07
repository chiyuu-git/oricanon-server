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
 * date、projectName、recordType 仅能查找基础类别下对应的表中的数据数据
 */
export class QueryOneBasicTypeProjectRecordDto {
    @IsString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    recordType: RecordType;
}

export class QueryRangeBasicTypeProjectRecordDto {
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
