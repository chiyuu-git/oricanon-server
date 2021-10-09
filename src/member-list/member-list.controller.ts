import { Controller, Get, Post, Body, Patch, Delete, Query, Param } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MemberListService } from './member-list.service';
import { CreateMemberListDto } from './dto/create-member-list.dto';
import { UpdateMemberListDto } from './dto/update-member-list.dto';
import { QueryMemberListDto } from './dto/query-member-list-dto';
import { ListType, ProjectName } from './member-list.type';

@ApiTags('member_list')
@Controller('member_list')
export class MemberListController {
    constructor(private readonly service: MemberListService) {}

    @Post()
    create(@Body() createMemberListDto: CreateMemberListDto) {
        return this.service.create(createMemberListDto);
    }

    // 不需要 findAll 使用 format_list_with_project 代替
    // @Get('/all_project')
    // findAll() {
    //     return this.projectsService.findAll();
    // }

    @Get('/member_list')
    @ApiQuery({ name: 'type', enum: ListType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QueryMemberListDto) {
        const { projectName, type } = query;
        return this.service.findOne({ projectName, type });
    }

    @Patch()
    @ApiBody({ type: UpdateMemberListDto })
    update(@Body() updateMemberListDto: UpdateMemberListDto) {
        // 要么是路由带上多个param
        // 要么是从body中取
        const { projectName, type } = updateMemberListDto;
        return this.service.update({ projectName, type }, updateMemberListDto);
    }

    @Delete()
    @ApiQuery({ type: QueryMemberListDto })
    remove(@Query() query: QueryMemberListDto) {
        const { projectName, type } = query;
        return this.service.remove({ projectName, type });
    }

    /**
     * 返回所有listType类型的list
     */
    @Get('list_of_type/:type')
    @ApiParam({ name: 'type', enum: ListType })
    async findListOfType(@Param('type') type: ListType) {
        if (ListType[type]) {
            const MemberListsOfType = await this.service.findListByType(type);
            return MemberListsOfType;
        }

        return `type ${type} not exist`;
    }

    /**
     * 获取所有角色的Tags
     */
    @Get('all_character_tag')
    async findAllCharacterTags() {
        const allCharacterTags = await this.service.findAllCharacterTags();

        return allCharacterTags;
    }

    /**
     * 获取所有角色cp的Tags
     */
    @Get('all_couple_tag')
    async findAllCoupleTags() {
        const allCoupleTags = await this.service.findAllCoupleTags();

        return allCoupleTags;
    }

    /**
     * 返回以 projectName 为主要字段整合全部 memberList
     */
    @Get('list_format_with_project')
    async findListFormatWithProject() {
        const formatList = await this.service.formatListWithProject();

        return formatList;
    }
}
