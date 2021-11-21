import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectName, CharacterRecordType } from '@chiyu-bit/canon.root';
import { CoupleTagService } from './couple-tag.service';
import { CreateCoupleTagDto } from './dto/create-couple-tag.dto';
import { QueryCoupleTagDto } from './dto/query-conpule-tag.dto';
import { UpdateCoupleTagDto } from './dto/update-couple-tag.dto';

@ApiTags('couple_tag')
@Controller('couple_tag')
export class CoupleTagController {
    constructor(private readonly coupleTagService: CoupleTagService) {}

    @Post()
    create(@Body() createCoupleTagDto: CreateCoupleTagDto) {
        return this.coupleTagService.create(createCoupleTagDto);
    }

    @Get('/all')
    findAll() {
        return this.coupleTagService.findAll();
    }

    @Get('/couple_tag')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CharacterRecordType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QueryCoupleTagDto) {
        const { date, projectName, recordType } = query;
        return this.coupleTagService.findOne({ date, projectName, recordType });
    }

    @Patch()
    @ApiBody({ type: UpdateCoupleTagDto })
    update(@Body() updateCoupleTagDto: UpdateCoupleTagDto) {
        // 要么是路由带上多个param
        // 要么是从body中取
        const { date, projectName, recordType } = updateCoupleTagDto;
        return this.coupleTagService.update({ date, projectName, recordType }, updateCoupleTagDto);
    }

    @Delete()
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CharacterRecordType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    remove(@Query() query: QueryCoupleTagDto) {
        const { date, projectName, recordType } = query;
        return this.coupleTagService.remove({ date, projectName, recordType });
    }
}
