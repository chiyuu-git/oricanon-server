import { IsDateString, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { RecordType } from '@common/record';

export class CreateRecordDto {
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    recordType: RecordType;

    @IsString()
    romaName: string;

    @IsNumber()
    record: number;
}
