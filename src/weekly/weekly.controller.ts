import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WeeklyService } from './weekly.service';

@ApiTags('weekly')
@Controller('weekly')
export class WeeklyController {
    constructor(private readonly service: WeeklyService) {}

    /**
     * 默认返回最新一期的周报
     *
     * @returns
     */
    @Get('/weekly_info')
    findLatestWeeklyInfo() {
        return this.service.getWeeklyInfo();
    }

    /**
     * 返回指定截止日期当周的周报
     *
     * @param id
     * @returns
     */
    @Get('/weekly_info/:endDate')
    findOne(@Param('endDate') endDate: string) {
        return this.service.getWeeklyInfo(endDate);
    }
}
