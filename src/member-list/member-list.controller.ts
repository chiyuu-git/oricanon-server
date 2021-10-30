import { Controller, Get, Post, Body, Patch, Delete, Query, Param } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectName, BasicType } from '@chiyu-bit/canon.root';
import { MemberListService } from './member-list.service';
import { CreateMemberListDto } from './dto/create-member-list.dto';
import { UpdateMemberListDto } from './dto/update-member-list.dto';
import { QueryMemberListDto } from './dto/query-member-list-dto';

@ApiTags('member_list')
@Controller('member_list')
export class MemberListController {
    constructor(private readonly service: MemberListService) {}

    @Post()
    @ApiBody({ type: CreateMemberListDto })
    create(@Body() createMemberListDto: CreateMemberListDto) {
        return this.service.create(createMemberListDto);
    }

    @Get('/member_list')
    @ApiQuery({ name: 'type', enum: BasicType })
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
     * 返回所有 type 类型的list
     */
    @Get('list_of_type/:type')
    @ApiParam({ name: 'type', enum: BasicType })
    async getListOfType(@Param('type') type: BasicType) {
        if (BasicType[type]) {
            const MemberListsOfType = await this.service.findListByType(type);
            return MemberListsOfType;
        }

        return `type ${type} not exist`;
    }

    /**
     * 获取所有角色的Tags
     */
    @Get('all_character_tag')
    async getAllCharacterTag() {
        const allCharacterTag = await this.service.findAllCharacterTag();

        return allCharacterTag;
    }

    /**
     * 获取所有角色cp的Tags
     */
    @Get('all_couple_tag')
    async getAllCoupleTag() {
        const allCoupleTag = await this.service.findAllCoupleTag();

        return allCoupleTag;
    }

    /**
     * 获取所有声优的推特帐号
     */
    @Get('all_seiyuu_twitter_account')
    async getAllSeiyuuTwitterAccount() {
        const allSeiyuuTwitterAccount = await this.service.findAllSeiyuuTwitterAccount();

        return allSeiyuuTwitterAccount;
    }

    /**
     * 返回以 projectName 为主要字段整合全部 memberList
     */
    @Get('list_format_with_project')
    async getListFormatWithProject() {
        const formatList = await this.service.formatListWithProject();

        return formatList;
    }
}
