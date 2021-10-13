import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CoupleTagService } from './couple-tag.service';
import { ProjectName, CoupleTagType } from './couple-tag.type';
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
    @ApiQuery({ name: 'type', enum: CoupleTagType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QueryCoupleTagDto) {
        const { date, projectName, type } = query;
        return this.coupleTagService.findOne({ date, projectName, type });
    }

    @Patch()
    @ApiBody({ type: UpdateCoupleTagDto })
    update(@Body() updateCoupleTagDto: UpdateCoupleTagDto) {
        // 要么是路由带上多个param
        // 要么是从body中取
        const { date, projectName, type } = updateCoupleTagDto;
        return this.coupleTagService.update({ date, projectName, type }, updateCoupleTagDto);
    }

    @Delete()
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CoupleTagType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    remove(@Query() query: QueryCoupleTagDto) {
        const { date, projectName, type } = query;
        return this.coupleTagService.remove({ date, projectName, type });
    }
}
