import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    QueryInfoTypeWeekly,
    QueryWeeklyDetail,
} from './query-weekly-info.dto';
import { WeeklyService } from './weekly.service';

@ApiTags('weekly')
@Controller('weekly')
export class WeeklyController {
    constructor(private readonly service: WeeklyService) {}

    // TODO: 整合所有的信息，减少请求次数
    @Get('/info_type_weekly')
    findInfoTypeWeekly(@Query() query: QueryInfoTypeWeekly) {
        const { basicType, recordType: infoType, endDate } = query;
        // console.log(query);
        return this.service.getInfoTypeWeekly({ basicType, endDate, recordType: infoType });
    }

    @Get('/weekly_detail_of_twitter_follower')
    findTwitterFollowerWeeklyDetail(@Query() query: QueryWeeklyDetail) {
        const { projectName, endDate } = query;
        // console.log(query);
        return this.service.getTwitterFollowerWeeklyDetail({ projectName, endDate });
    }
}
