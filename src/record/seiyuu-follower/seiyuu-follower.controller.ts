import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Category, ProjectName } from '@common/root';
import { SeiyuuRecordType } from '@common/record';
import { SeiyuuFollowerService } from './seiyuu-follower.service';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';
import { QueryOneProjectRecordOfType } from '../common/dto/query-record-data.dto';

@ApiTags('seiyuu_follower')
@Controller('seiyuu_follower')
export class SeiyuuFollowerController {
    constructor(private readonly service: SeiyuuFollowerService) {}

    @Post('/create_project_record')
    createProjectRecord(@Body() body: CreateRecordOfProjectDto) {
        return this.service.createRecordOfProject(body);
    }

    @Get('/one_project_record')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    @ApiQuery({ name: 'recordType', type: 'string' })
    findOneBasicTypeProjectRecord(@Query() query: QueryOneProjectRecordOfType) {
        return this.service.findOneProjectRecord(query);
    }
}
