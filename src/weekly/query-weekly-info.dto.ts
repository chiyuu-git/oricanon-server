import { IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { formatDate } from 'src/utils';
import { AggregationType, BasicType, InfoType, RecordType } from '@chiyu-bit/canon.root';

abstract class BaseQuery {
    @IsString()
    basicType: BasicType;

    // TODO: custom validator
    // @IsDateString()
    // @Transform(({ value }) => formatDate(value))
    endDate?: string;
}

export class QueryRecordTypeWeeklyInfo extends BaseQuery {
    @IsString()
    recordType: RecordType;
}
export class QueryAggregationTypeWeeklyInfo extends BaseQuery {
    @IsString()
    aggregationType: AggregationType;
}

export class QueryTypeWeeklyInfo extends BaseQuery {
    infoType: InfoType
}
