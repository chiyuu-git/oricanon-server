import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectName, SeiyuuRecordType } from '@chiyu-bit/canon.root';
import { SeiyuuFollowerService } from './seiyuu-follower.service';
import { CreateSeiyuuFollowerDto } from './dto/create-seiyuu-follower.dto';
import { QuerySeiyuuFollowerDto } from './dto/query-seiyuu-follower.dto';
import { UpdateSeiyuuFollowerDto } from './dto/update-seiyuu-follower.dto';
import { QueryRangeRecordDto } from '../common/dto/query-record-data.dto';

@ApiTags('seiyuu_follower')
@Controller('seiyuu_follower')
export class SeiyuuFollowerController {
    constructor(private readonly service: SeiyuuFollowerService) {}

    @Post()
    create(@Body() createSeiyuuFollowerDto: CreateSeiyuuFollowerDto) {
        return this.service.create(createSeiyuuFollowerDto);
    }

    @Get('/all')
    findAll() {
        return this.service.findAll();
    }

    @Get('/seiyuu_follower')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QuerySeiyuuFollowerDto) {
        const { date, projectName } = query;
        return this.service.findOne({ date, projectName });
    }

    @Get('/seiyuu_follower_between_range')
    @ApiQuery({ name: 'from', type: 'string' })
    @ApiQuery({ name: 'to', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findRangeRecord(@Query() query: QueryRangeRecordDto) {
        const { from, to, projectName } = query;
        return this.service.findRecordInRange({ from, to, projectName, recordType: SeiyuuRecordType.twitterFollower });
    }

    @Patch()
    @ApiBody({ type: UpdateSeiyuuFollowerDto })
    update(@Body() updateSeiyuuFollowerDto: UpdateSeiyuuFollowerDto) {
        // 要么是路由带上多个param
        // 要么是从body中取
        const { date, projectName } = updateSeiyuuFollowerDto;
        return this.service.update({ date, projectName }, updateSeiyuuFollowerDto);
    }

    @Delete()
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    remove(@Query() query: QuerySeiyuuFollowerDto) {
        const { date, projectName } = query;
        return this.service.remove({ date, projectName });
    }
}
