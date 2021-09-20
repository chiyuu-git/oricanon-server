import { Controller, Get, Post, Body, Patch, Delete, Query, Param } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MemberListsService } from './member-lists.service';
import { CreateMemberListDto } from './dto/create-member-list.dto';
import { UpdateMemberListDto } from './dto/update-member-list.dto';
import { QueryMemberListDto } from './dto/query-member-list-dto';
import { ListType, ProjectName } from './member-lists.type';

@ApiTags('MemberLists')
@Controller('memberLists')
export class MemberListsController {
    constructor(private readonly memberListsService: MemberListsService) {}

    @Post()
    create(@Body() createMemberListDto: CreateMemberListDto) {
        return this.memberListsService.create(createMemberListDto);
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
        return this.memberListsService.findOne({ projectName, type });
    }

    @Patch()
    @ApiBody({ type: UpdateMemberListDto })
    update(@Body() updateMemberListDto: UpdateMemberListDto) {
        // 要么是路由带上多个param
        // 要么是从body中取
        const { projectName, type } = updateMemberListDto;
        return this.memberListsService.update({ projectName, type }, updateMemberListDto);
    }

    @Delete()
    @ApiQuery({ type: QueryMemberListDto })
    remove(@Query() query: QueryMemberListDto) {
        const { projectName, type } = query;
        return this.memberListsService.remove({ projectName, type });
    }

    /**
     * 返回所有listType类型的list
     */
    @Get('list_of_type/:type')
    @ApiParam({ name: 'type', enum: ListType })
    async findListOfType(@Param('type') type: ListType) {
        if (ListType[type]) {
            const MemberListsOfType = await this.memberListsService.findListByType({ type });
            return `find all list of ${type} ${JSON.stringify(MemberListsOfType)}`;
        }

        return `type ${type} not exist`;
    }

    /**
     * 以 projectName 为主要字段整合全部 memberList ，并返回
     */
    @Get('list_format_with_project')
    async formatListWithProject() {
        const formatList = await this.memberListsService.formatListWithProject();
        return formatList;
    }
}
