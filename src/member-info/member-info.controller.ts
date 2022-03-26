import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Category, ProjectName } from '@common/root';
import { MemberInfoService } from './member-info.service';
import { QueryMemberInfoByRomaNameDto, QueryProjectMemberInfoDto } from './dto/query-member-info.dto';

@ApiTags('member_info')
@Controller('member_info')
export class MemberInfoController {
    constructor(private readonly service: MemberInfoService) {}

    @Get('/project_member_info_of_category')
    @ApiQuery({ name: 'category', enum: Category })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    getProjectMemberInfoByCategory(@Query() query: QueryProjectMemberInfoDto) {
        const { category, projectName } = query;
        // const res = this.service.findMemberInfoByTypeAndProject(Category.chara, projectName);
        return this.service.findProjectMemberInfoByCategory(category, projectName);
    }

    @Get('/member_info')
    @ApiQuery({ name: 'category', enum: Category })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    getMemberInfoByRomaName(@Query() { category, romaName }: QueryMemberInfoByRomaNameDto) {
        // const res = this.service.findMemberInfoByTypeAndProject(Category.chara, projectName);
        return this.service.findMemberInfoByRomaName(category, romaName);
    }

    /**
     * 获取所有角色的Tags
     */
    @Get('chara_tag_list')
    async getCharaTagList() {
        const charaTagList = await this.service.findCharaTagList();

        return charaTagList;
    }

    /**
     * 获取所有角色的Tags
     */
    @Get('seiyuu_twitter_account_list')
    async getSeiyuuTwitterAccountList() {
        const seiyuuTwitterAccountList = await this.service.findSeiyuuTwitterAccountList();

        return seiyuuTwitterAccountList;
    }

    /**
     * 获取所有角色的Tags
     */
    @Get('couple_tag_list')
    async getCoupleTagList() {
        const coupleTagList = await this.service.findCoupleTagList();

        return coupleTagList;
    }

    /**
     * 返回以 projectName 为 key 整合 memberList`
     */
    @Get('list_format_with_project')
    async getListFormatWithProject() {
        const formatList = await this.service.formatListWithProject();

        return formatList;
    }

    /**
     * 返回以 projectName 为主要字段整合全部 memberList
     */
    @Get('member_info_map')
    @ApiQuery({ name: 'type', enum: Category })
    async getMemberInfoMapOfType(@Query('type') type: Category) {
        if (Category[type]) {
            const memberInfoMap = await this.service.findMemberInfoMapOfType(type);

            return memberInfoMap;
        }

        return `type ${type} not exist`;
    }
}
