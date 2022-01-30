import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectName } from '@common/root';
import { CharaTagService } from './chara-tag.service';
import {
    QueryOneProjectRecord,
    QueryRangeProjectRecordOfTypeDto,
} from '../common/dto/query-record-data.dto';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';

@ApiTags('chara_tag')
@Controller('chara_tag')
export class CharaTagController {
    constructor(
        private readonly service: CharaTagService,
    ) {}

    @Post('/create_project_record')
    createProjectRecord(@Body() createProjectCharaRecordDto: CreateRecordOfProjectDto) {
        return this.service.createCharaRecordOfProject(createProjectCharaRecordDto);
    }

    @Get('/one_project_record')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    @ApiQuery({ name: 'recordType', type: 'string' })
    findOneBasicTypeProjectRecord(@Query() query: QueryOneProjectRecord) {
        return this.service.findOneProjectRecord(query);
    }

    @Get('/range_project_record')
    @ApiQuery({ name: 'from', type: 'string' })
    @ApiQuery({ name: 'to', type: 'string' })
    @ApiQuery({ name: 'recordType', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findRangeBasicTypeProjectRecord(@Query() query: QueryRangeProjectRecordOfTypeDto) {
        return this.service.findRangeBasicTypeProjectRecord(query);
    }
}
