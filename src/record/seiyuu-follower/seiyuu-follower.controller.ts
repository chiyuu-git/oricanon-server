import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BasicType, ProjectName } from '@common/root';
import { SeiyuuRecordType } from '@common/record';
import { SeiyuuFollowerService } from './seiyuu-follower.service';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';
import { QueryOneProjectRecord } from '../common/dto/query-record-data.dto';

@ApiTags('seiyuu_follower')
@Controller('seiyuu_follower')
export class SeiyuuFollowerController {
    constructor(private readonly service: SeiyuuFollowerService) {}

    @Post('/create_project_seiyuu_record')
    createProjectRecord(@Body() createProjectSeiyuuRecordDto: CreateRecordOfProjectDto) {
        return this.service.createSeiyuuRecordOfProject(createProjectSeiyuuRecordDto);
    }

    @Get('/project_record')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    @ApiQuery({ name: 'recordType', type: 'string' })
    findOneBasicTypeProjectRecord(@Query() query: QueryOneProjectRecord) {
        return this.service.findOneProjectRecord(query);
    }
}
