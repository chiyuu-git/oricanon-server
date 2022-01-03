import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectName, CharaRecordType } from '@chiyu-bit/canon.root';
import { CoupleTagService } from './couple-tag.service';
import { CreateProjectCoupleRecordDto } from './dto/create-couple-tag.dto';
import { QueryCoupleTagDto } from './dto/query-conpule-tag.dto';
import { UpdateCoupleTagDto } from './dto/update-couple-tag.dto';

@ApiTags('couple_tag')
@Controller('couple_tag')
export class CoupleTagController {
    constructor(private readonly service: CoupleTagService) {}

    @Post('/create_project_couple_record')
    createProjectCoupleRecord(@Body() createCharacterTagDto: CreateProjectCoupleRecordDto) {
        return this.service.createProjectCoupleRecord(createCharacterTagDto);
    }

    @Get('/couple_tag')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CharaRecordType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QueryCoupleTagDto) {
        const { date, projectName, recordType } = query;
        return this.service.findOne({ date, projectName, recordType });
    }
}
