import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Category, ProjectName } from '@common/root';
import { MemberInfoService } from './member-info.service';
import {
    QueryMemberInfoByRomaNameDto,
    QueryMembersOfCategoryDto,
    QueryProjectMembersDto,
} from './dto/query-member-info.dto';

@ApiTags('member_info')
@Controller('member_info')
export class MemberInfoController {
    constructor(private readonly service: MemberInfoService) {}

    @Get('/member_list_of_category')
    getMembersOfCategory(@Query() query: QueryMembersOfCategoryDto) {
        const { category, onlyActive } = query;
        return this.service.findMembersOfCategory(category, { onlyActive });
    }

    @Get('/project_member_list_of_category')
    getProjectMembersOfCategory(@Query() query: QueryProjectMembersDto) {
        const { category, projectName, onlyActive } = query;
        return this.service.findProjectMembersOfCategory(category, projectName, { onlyActive });
    }

    @Get('/member_info_of_name')
    @ApiQuery({ name: 'category', enum: Category })
    @ApiQuery({ name: 'romaName' })
    getMemberInfoByRomaName(@Query() { category, romaName }: QueryMemberInfoByRomaNameDto) {
        // const res = this.service.findMemberInfoByTypeAndProject(Category.chara, projectName);
        return this.service.findMemberInfoByRomaName(category, romaName);
    }

    /**
     * 返回以 romaName 为 key 整合全部 members
     */
    @Get('member_info_map_of_category')
    @ApiQuery({ name: 'type', enum: Category })
    async getMemberInfoMapOfCategory(@Query('type') type: Category) {
        if (Category[type]) {
            const memberInfoMap = await this.service.findMemberInfoMapOfCategory(type);

            return memberInfoMap;
        }

        return `type ${type} not exist`;
    }
}
