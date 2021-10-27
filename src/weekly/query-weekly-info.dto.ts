import { IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { AggregationType, BasicType, InfoType, RecordType } from '@chiyu-bit/canon.root';
import { ApiProperty } from '@nestjs/swagger';

abstract class BaseQuery {
    @IsString()
    basicType: BasicType;

    // TODO: custom validator
    // @IsDateString()
    // @Transform(({ value }) => formatDate(value))
    endDate?: string;
}

export class QueryRecordWeeklyInfo extends BaseQuery {
    @IsString()
    @ApiProperty({
        type: String,
        description: 'infoType',
    })
    infoType: InfoType;
}
