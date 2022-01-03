import {
    Controller,
    Get, Post, Body, Patch, Delete,
    Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CharacterRecordType, ProjectName } from '@chiyu-bit/canon.root';
import { CharacterTagService } from './character-tag.service';
import { CreateCharacterTagDto } from './dto/create-character-tag.dto';
import { QueryCharacterTagDto } from './dto/query-character-tag.dto';
import { UpdateCharacterTagDto } from './dto/update-character-tag.dto';

@ApiTags('character_tag')
@Controller('character_tag')
export class CharacterTagController {
    constructor(
        private readonly service: CharacterTagService,
    ) {}

    @Post()
    create(@Body() createCharacterTagDto: CreateCharacterTagDto) {
        return this.service.create(createCharacterTagDto);
    }

    @Post('/create_project_chara_record')
    createProjectCharaRecord(@Body() createCharacterTagDto: CreateCharacterTagDto) {
        return this.service.createProjectCharaRecord(createCharacterTagDto);
    }

    @Get('/all')
    findAll() {
        return this.service.findAll();
    }

    @Get('/seiyuu_follower')
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CharacterRecordType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QueryCharacterTagDto) {
        const { date, projectName, recordType } = query;
        return this.service.findOne({ date, projectName, recordType });
    }

    @Patch()
    @ApiBody({ type: UpdateCharacterTagDto })
    update(@Body() updateCharacterTagDto: UpdateCharacterTagDto) {
        // 要么是路由带上多个param
        // 要么是从body中取
        const { date, projectName, recordType } = updateCharacterTagDto;
        return this.service.update({ date, projectName, recordType }, updateCharacterTagDto);
    }

    @Delete()
    @ApiQuery({ name: 'date', type: 'string' })
    @ApiQuery({ name: 'type', enum: CharacterRecordType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    remove(@Query() query: QueryCharacterTagDto) {
        const { date, projectName, recordType } = query;
        return this.service.remove({ date, projectName, recordType });
    }
}
