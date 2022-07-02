import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
    @IsString()
    account: string;

    @IsString()
    uri: string;

    @IsDate()
    @Transform(({ value }) => new Date(value))
    createdAt: Date;

    @IsString()
    platformType: string;

    @IsString()
    @IsOptional()
    appendixType?: string;
}
