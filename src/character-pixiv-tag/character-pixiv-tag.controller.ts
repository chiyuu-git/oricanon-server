import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CharacterPixivTagService } from './character-pixiv-tag.service';
import { CharacterTagType, ProjectName } from './character-pixiv-tag.type';
import { CreateCharacterPixivTagDto } from './dto/create-character-pixiv-tag.dto';
import { QueryCharacterPixivTagDto } from './dto/query-character-pixiv-tag.dto';
import { UpdateCharacterPixivTagDto } from './dto/update-character-pixiv-tag.dto';

@ApiTags('character_pixiv_tag')
@Controller('character_pixiv_tag')
export class CharacterPixivTagController {
    constructor(private readonly service: CharacterPixivTagService) {}

    @Post()
    create(@Body() createCharacterPixivTagDto: CreateCharacterPixivTagDto) {
        return this.service.create(createCharacterPixivTagDto);
    }

    @Get('/all')
    findAll() {
        return this.service.findAll();
    }

    @Get('/seiyuu_follower')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CharacterTagType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QueryCharacterPixivTagDto) {
        const { date, projectName, type } = query;
        return this.service.findOne({ date, projectName, type });
    }

    @Patch()
    @ApiBody({ type: UpdateCharacterPixivTagDto })
    update(@Body() updateCharacterPixivTagDto: UpdateCharacterPixivTagDto) {
        // 要么是路由带上多个param
        // 要么是从body中取
        const { date, projectName, type } = updateCharacterPixivTagDto;
        return this.service.update({ date, projectName, type }, updateCharacterPixivTagDto);
    }

    @Delete()
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CharacterTagType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    remove(@Query() query: QueryCharacterPixivTagDto) {
        const { date, projectName, type } = query;
        return this.service.remove({ date, projectName, type });
    }
}
