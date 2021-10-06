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
    @Get()
    findLatestWeekly() {
        return this.service.generateWeekly();
    }

    /**
     * 返回指定截止日期当周的周报
     *
     * @param id
     * @returns
     */
    @Get(':endDate')
    findOne(@Param('endDate') endDate: string) {
        return this.service.generateWeekly(endDate);
    }
}
