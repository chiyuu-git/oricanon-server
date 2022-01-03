import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectName, SeiyuuRecordType } from '@chiyu-bit/canon.root';
import { SeiyuuFollowerService } from './seiyuu-follower.service';
import { CreateProjectSeiyuuRecordDto } from './dto/create-seiyuu-follower.dto';
import { QuerySeiyuuFollowerDto } from './dto/query-seiyuu-follower.dto';
import { UpdateSeiyuuFollowerDto } from './dto/update-seiyuu-follower.dto';
import { QueryRangeRecordDto } from '../common/dto/query-record-data.dto';

@ApiTags('seiyuu_follower')
@Controller('seiyuu_follower')
export class SeiyuuFollowerController {
    constructor(private readonly service: SeiyuuFollowerService) {}

    @Post('/create_project_seiyuu_record')
    createProjectSeiyuuRecord(@Body() createProjectSeiyuuRecordDto: CreateProjectSeiyuuRecordDto) {
        return this.service.createProjectSeiyuuRecord(createProjectSeiyuuRecordDto);
    }

    @Get('/seiyuu_follower')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QuerySeiyuuFollowerDto) {
        const { date, projectName } = query;
        return this.service.findOne({ date, projectName });
    }
}
