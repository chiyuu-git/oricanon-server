import { IsArray, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { ProjectName, CharacterTagType } from '../character-tag.type';

export class CreateCharacterTagDto {
    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    date: string;

    @IsString()
    projectName: ProjectName;

    @IsString()
    type: CharacterTagType;

    @IsArray()
    records: number[];
}

