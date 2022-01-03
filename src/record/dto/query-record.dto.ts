import { IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { RecordType } from '@chiyu-bit/canon.root/record';

export class QueryRecordDTO {
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    recordType: RecordType;

    @IsString()
    romaName: string;
}
