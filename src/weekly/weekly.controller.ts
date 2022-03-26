import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    QueryRecordTypeWeekly,
    QueryWeeklyDetail,
} from './query-weekly-info.dto';
import { WeeklyService } from './weekly.service';

@ApiTags('weekly')
@Controller('weekly')
export class WeeklyController {
    constructor(private readonly service: WeeklyService) {}

    // TODO: 整合所有的信息，减少请求次数
    @Get('/record_type_weekly')
    getRecordTypeWeekly(@Query() query: QueryRecordTypeWeekly) {
        const { category, recordType, endDate } = query;
        // console.log(query);
        return this.service.getRecordTypeWeekly({ category, endDate, recordType });
    }

    @Get('/weekly_detail_of_twitter_follower')
    getTwitterFollowerWeeklyDetail(@Query() query: QueryWeeklyDetail) {
        const { projectName, endDate } = query;
        // console.log(query);
        return this.service.getTwitterFollowerWeeklyDetail({ projectName, endDate });
    }
}
