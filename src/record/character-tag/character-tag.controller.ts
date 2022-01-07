import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectName } from '@common/root';
import { CharaRecordType } from '@common/record';
import { CharacterTagService } from './character-tag.service';
import {
    QueryOneBasicTypeProjectRecordDto,
    QueryRangeBasicTypeProjectRecordDto,
} from '../common/dto/query-record-data.dto';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';

@ApiTags('character_tag')
@Controller('character_tag')
export class CharacterTagController {
    constructor(
        private readonly service: CharacterTagService,
    ) {}

    @Post('/create_project_record')
    createProjectRecord(@Body() createProjectCharaRecordDto: CreateRecordOfProjectDto) {
        return this.service.createCharaRecordOfProject(createProjectCharaRecordDto);
    }

    @Get('/one_project_record')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    @ApiQuery({ name: 'recordType', type: 'string' })
    findOneBasicTypeProjectRecord(@Query() query: QueryOneBasicTypeProjectRecordDto) {
        return this.service.findOneBasicTypeProjectRecord(query);
    }

    @Get('/range_project_record')
    @ApiQuery({ name: 'from', type: 'string' })
    @ApiQuery({ name: 'to', type: 'string' })
    @ApiQuery({ name: 'recordType', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findRangeBasicTypeProjectRecord(@Query() query: QueryRangeBasicTypeProjectRecordDto) {
        return this.service.findRangeBasicTypeProjectRecord(query);
    }
}
