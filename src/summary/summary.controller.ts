import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    QueryIncrementRankOfTypeInRange,
    QueryRelativeIncrementOfTypeInRange,
} from './query-summary-info.dto';
import { SummaryService } from './summary.service';

@ApiTags('summary')
@Controller('summary')
export class SummaryController {
    constructor(private readonly service: SummaryService) {}

    @Get('/relative_increment_of_type_in_range')
    findRelativeIncrementOfTypeInRange(@Query() query: QueryRelativeIncrementOfTypeInRange) {
        return this.service.getRelativeIncrementOfTypeInRange(query);
    }

    @Get('/week_increment_rank_of_type_in_range')
    findIncrementRankOfTypeInRange(@Query() query: QueryIncrementRankOfTypeInRange) {
        return this.service.getWeekIncrementRankOfTypeInRange(query);
    }
}
