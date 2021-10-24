import { IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { BasicType, RecordType } from '@chiyu-bit/canon.root';

export class QueryWeeklyInfoDto {
    @IsString()
    basicType: BasicType;

    @IsString()
    recordType: RecordType;

    // TODO: custom validator
    // @IsDateString()
    // @Transform(({ value }) => formatDate(value))
    endDate?: string;
}
