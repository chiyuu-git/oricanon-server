import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryRecordWeeklyInfo } from './query-weekly-info.dto';
import { WeeklyService } from './weekly.service';

@ApiTags('weekly')
@Controller('weekly')
export class WeeklyController {
    constructor(private readonly service: WeeklyService) {}

    @Get('/weekly_info_of_record_type')
    findRecordWeeklyInfo(@Query() query: QueryRecordWeeklyInfo) {
        const { basicType, infoType, endDate } = query;
        // console.log(query);
        return this.service.getRecordTypeWeeklyInfo({ basicType, endDate, infoType });
    }
}
