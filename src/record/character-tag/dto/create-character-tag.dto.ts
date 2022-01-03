import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { ProjectName, CharaRecordType } from '@chiyu-bit/canon.root';

export class CreateProjectCharaRecordDto {
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    @IsOptional()
    recordType: CharaRecordType;

    @IsArray()
    @Transform(({ value }) => JSON.parse(value))
    records: number[];
}

