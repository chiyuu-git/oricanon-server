import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectName } from '@common/root';
import { CoupleRecordType } from '@common/record';
import { CoupleTagService } from './couple-tag.service';
import { QueryOneBasicTypeProjectRecordDto } from '../common/dto/query-record-data.dto';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';

@ApiTags('couple_tag')
@Controller('couple_tag')
export class CoupleTagController {
    constructor(private readonly service: CoupleTagService) {}

    @Post('/create_project_couple_record')
    createProjectRecord(@Body() createProjectCoupleRecordDto: CreateRecordOfProjectDto) {
        return this.service.createCoupleRecordOfProject(createProjectCoupleRecordDto);
    }

    @Get('/project_record')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    @ApiQuery({ name: 'recordType', type: 'string' })
    findOneBasicTypeProjectRecord(@Query() query: QueryOneBasicTypeProjectRecordDto) {
        return this.service.findOneBasicTypeProjectRecord(query);
    }
}
