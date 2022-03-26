import { IsArray, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from '@utils/date';
import { Category, ProjectName } from '@common/root';
import { RecordType } from '@common/record';

export class CreateRecordOfProjectDto {
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    recordType: RecordType;

    @IsArray()
    @Transform(({ value }) => JSON.parse(value))
    records: number[];
}

