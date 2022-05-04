import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    QueryHistoricalWeekIncrementOfPercentileDto,
    QueryMemberRecordInRangeDto,
    QueryProjectRecordInRangeDto,
    QueryProjectRelativeIncrementInfoDto,
    QueryRecordInRangeDto,
} from './query-summary-info.dto';
import { SummaryService } from './summary.service';

@ApiTags('summary')
@Controller('summary')
export class SummaryController {
    constructor(private readonly service: SummaryService) {}

    @Get('/historical_week_increment_of_percentile')
    findHistoricalWeekIncrementOfPercentile(@Query() query: QueryHistoricalWeekIncrementOfPercentileDto) {
        return this.service.getHistoricalWeekIncrementOfPercentile(query);
    }

    @Get('/week_increment_rank_in_range')
    findWeekIncrementRankInRange(@Query() query: QueryRecordInRangeDto) {
        return this.service.getWeekIncrementRankInRange(query);
    }

    @Get('/week_increment_of_project_in_range')
    findWeekIncrementOfProjectInRange(@Query() query: QueryProjectRecordInRangeDto) {
        return this.service.getProjectWeekIncrementInRange(query);
    }

    @Get('/week_increment_of_member_in_range')
    findWeekIncrementOfMemberInRange(@Query() query: QueryMemberRecordInRangeDto) {
        return this.service.getMemberWeekIncrementInRange(query);
    }

    @Get('/project_relative_increment')
    findProjectRelativeIncrement(@Query() query: QueryProjectRecordInRangeDto) {
        return this.service.getProjectRelativeIncrement(query);
    }

    @Get('/project_relative_increment_info')
    findProjectRelativeIncrementInfo(@Query() query: QueryProjectRelativeIncrementInfoDto) {
        const { category, projectName, from, to } = query;
        return this.service.getProjectRelativeIncrementInfo(category, projectName, from, to);
    }

    @Get('/relative_increment_in_range')
    findRelativeIncrementInRange(@Query() query: QueryProjectRecordInRangeDto) {
        return this.service.getRelativeIncrementInRange(query);
    }
}
