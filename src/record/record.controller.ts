import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CharacterRecordType, ProjectName } from '@chiyu-bit/canon.root';
import { CharaRecordType } from '@chiyu-bit/canon.root/record';
import { RecordService } from './record.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { QueryRecordDTO } from './dto/query-record.dto';

@ApiTags('character_tag')
@Controller('character_tag')
export class RecordController {
    constructor(private readonly service: RecordService) {}

    @Post()
    create(@Body() createRecordDto: CreateRecordDto) {
        return this.service.create(createRecordDto);
    }

    // @Get('/seiyuu_follower')
    // @ApiQuery({ name: 'date', type: 'string' })
    // @ApiQuery({ name: 'recordType', enum: CharaRecordType })
    // @ApiQuery({ name: 'romaName', type: 'string' })
    // findOne(@Query() query: QueryRecordDTO) {
    //     const { date, recordType, romaName } = query;
    //     return this.service.findOne({ date, recordType, romaName });
    // }
}
