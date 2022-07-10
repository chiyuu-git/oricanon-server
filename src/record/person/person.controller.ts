import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Category, ProjectName } from '@common/root';
import { PersonRecordType } from '@common/record';
import { PersonFollowerService } from './person.service';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';
import { QueryOneProjectRecordInCategory } from '../common/dto/query-record-data.dto';

@ApiTags('person_follower')
@Controller('person_follower')
export class PersonFollowerController {
    constructor(private readonly service: PersonFollowerService) {}

    @Post('/create_project_record')
    createProjectRecord(@Body() body: CreateRecordOfProjectDto) {
        return this.service.createRecordOfProject(body);
    }

    @Get('/one_project_record')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    @ApiQuery({ name: 'recordType', type: 'string' })
    findOneBasicTypeProjectRecord(@Query() query: QueryOneProjectRecordInCategory) {
        return this.service.findOneProjectRecord(query);
    }
}
