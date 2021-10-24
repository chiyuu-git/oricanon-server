import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { RecordType } from '@chiyu-bit/canon.root';
import { QueryWeeklyInfoDto } from './query-weekly-info.dto';
import { WeeklyService } from './weekly.service';

@ApiTags('weekly')
@Controller('weekly')
export class WeeklyController {
    constructor(private readonly service: WeeklyService) {}

    @Get('/weekly_info_of_record_type')
    findRecordTypeWeeklyInfo(@Query() query: QueryWeeklyInfoDto) {
        const { basicType, recordType, endDate } = query;
        return this.service.getRecordTypeWeeklyInfo({ basicType, recordType, endDate });
    }
}
