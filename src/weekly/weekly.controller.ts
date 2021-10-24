import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryRecordTypeWeeklyInfo, QueryAggregationTypeWeeklyInfo } from './query-weekly-info.dto';
import { WeeklyService } from './weekly.service';

@ApiTags('weekly')
@Controller('weekly')
export class WeeklyController {
    constructor(private readonly service: WeeklyService) {}

    @Get('/weekly_info_of_record_type')
    findRecordTypeWeeklyInfo(@Query() query: QueryRecordTypeWeeklyInfo) {
        const { basicType, recordType, endDate } = query;
        return this.service.getTypeWeeklyInfo({ basicType, endDate, infoType: recordType });
    }

    @Get('/weekly_info_of_aggregation_type')
    findAggregationTypeWeeklyInfo(@Query() query: QueryAggregationTypeWeeklyInfo) {
        const { basicType, aggregationType, endDate } = query;
        return this.service.getTypeWeeklyInfo({ basicType, endDate, infoType: aggregationType });
    }
}
