import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CouplePixivTagService } from './couple-pixiv-tag.service';
import { ProjectName, CoupleTagType } from './couple-pixiv-tag.type';
import { CreateCouplePixivTagDto } from './dto/create-couple-pixiv-tag.dto';
import { QueryCouplePixivTagDto } from './dto/query-conpule-pixiv-tag.dto';
import { UpdateCouplePixivTagDto } from './dto/update-couple-pixiv-tag.dto';

@ApiTags('couple_pixiv_tag')
@Controller('couple_pixiv_tag')
export class CouplePixivTagController {
    constructor(private readonly couplePixivTagService: CouplePixivTagService) {}

    @Post()
    create(@Body() createCouplePixivTagDto: CreateCouplePixivTagDto) {
        return this.couplePixivTagService.create(createCouplePixivTagDto);
    }

    @Get('/all')
    findAll() {
        return this.couplePixivTagService.findAll();
    }

    @Get('/couple_pixiv_tag')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CoupleTagType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QueryCouplePixivTagDto) {
        const { date, projectName, type } = query;
        return this.couplePixivTagService.findOne({ date, projectName, type });
    }

    @Patch()
    @ApiBody({ type: UpdateCouplePixivTagDto })
    update(@Body() updateCouplePixivTagDto: UpdateCouplePixivTagDto) {
        // 要么是路由带上多个param
        // 要么是从body中取
        const { date, projectName, type } = updateCouplePixivTagDto;
        return this.couplePixivTagService.update({ date, projectName, type }, updateCouplePixivTagDto);
    }

    @Delete()
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CoupleTagType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    remove(@Query() query: QueryCouplePixivTagDto) {
        const { date, projectName, type } = query;
        return this.couplePixivTagService.remove({ date, projectName, type });
    }
}
