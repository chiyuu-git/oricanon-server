import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { ProjectName, CharacterRecordType } from '@chiyu-bit/canon.root';

export class CreateCharacterTagDto {
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    @IsOptional()
    recordType: CharacterRecordType;

    @IsArray()
    @Transform(({ value }) => JSON.parse(value))
    records: number[];
}

