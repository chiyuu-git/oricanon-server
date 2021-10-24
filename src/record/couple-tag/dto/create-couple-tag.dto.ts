import { IsArray, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { ProjectName, CharacterRecordType } from '@chiyu-bit/canon.root';

export class CreateCoupleTagDto {
    // TODO: custom validator
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    type: CharacterRecordType;

    @IsArray()
    @Transform(({ value }) => JSON.parse(value))
    records: number[];
}
