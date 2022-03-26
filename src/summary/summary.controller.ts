import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    QueryMemberRecordInRangeDto,
    QueryProjectRecordInRangeDto,
    QueryRecordInRangeDto,
} from './query-summary-info.dto';
import { SummaryService } from './summary.service';

@ApiTags('summary')
@Controller('summary')
export class SummaryController {
    constructor(private readonly service: SummaryService) {}

    @Get('/week_increment_rank_of_type_in_range')
    findWeekIncrementRankOfTypeInRange(@Query() query: QueryRecordInRangeDto) {
        return this.service.getWeekIncrementRankOfTypeInRange(query);
    }

    @Get('/week_increment_of_project_in_range')
    findWeekIncrementOfProjectInRange(@Query() query: QueryProjectRecordInRangeDto) {
        return this.service.getProjectWeekIncrementInRange(query);
    }

    @Get('/week_increment_of_member_in_range')
    findWeekIncrementOfMemberInRange(@Query() query: QueryMemberRecordInRangeDto) {
        return this.service.getMemberWeekIncrementInRange(query);
    }

    @Get('/relative_increment_of_type_in_range')
    findRelativeIncrementOfTypeInRange(@Query() query: QueryProjectRecordInRangeDto) {
        return this.service.getRelativeIncrementOfTypeInRange(query);
    }
}
