import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Category, ProjectName } from '@common/root';
import { CoupleRecordType } from '@common/record';
import { CoupleTagService } from './couple-tag.service';
import { QueryOneProjectRecordOfType } from '../common/dto/query-record-data.dto';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';

@ApiTags('couple_tag')
@Controller('couple_tag')
export class CoupleTagController {
    constructor(private readonly service: CoupleTagService) {}

    @Post('/create_project_record')
    createProjectRecord(@Body() body: CreateRecordOfProjectDto) {
        return this.service.createRecordOfProject(body);
    }

    @Get('/one_project_record')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    @ApiQuery({ name: 'recordType', type: 'string' })
    findOneProjectRecord(@Query() query: QueryOneProjectRecordOfType) {
        return this.service.findOneProjectRecord(query);
    }
}
