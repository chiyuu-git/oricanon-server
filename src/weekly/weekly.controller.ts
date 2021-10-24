import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { WeeklyService } from './weekly.service';

@ApiTags('weekly')
@Controller('weekly')
export class WeeklyController {
    constructor(private readonly service: WeeklyService) {}

    /**
     * 返回指定截止日期当周的周报, 默认返回最新一期的周报
     *
     * @returns
     */
    @Get('/weekly_info')
    @ApiQuery({
        name: 'endDate',
        required: false,
    })
    findLatestWeeklyInfo(@Query('endDate') endDate?: string) {
        return this.service.getWeeklyInfo(endDate);
    }
}
