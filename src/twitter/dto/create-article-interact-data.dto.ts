import { formatDate } from '@utils/date';
import { Transform } from 'class-transformer';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateArticleInteractDataDto {
    @IsString()
    uri: string;

    @IsNumber()
    @Transform(({ value }) => +value)
    replyCount: number;

    @IsNumber()
    @Transform(({ value }) => +value)
    retweetCount: number;

    @IsNumber()
    @Transform(({ value }) => +value)
    quoteCount: number;

    @IsNumber()
    @Transform(({ value }) => +value)
    favoriteCount: number;

    @IsDateString()
    @Transform(({ value }) => formatDate(value))
    recordDate: string;
}
