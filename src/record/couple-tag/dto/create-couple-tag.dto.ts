import { IsArray, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { ProjectName, CoupleRecordType } from '@chiyu-bit/canon.root';

export class CreateProjectCoupleRecordDto {
    // TODO: custom validator
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    recordType: CoupleRecordType;

    @IsArray()
    @Transform(({ value }) => JSON.parse(value))
    records: number[];
}
