import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { BasicType, ProjectName } from '@chiyu-bit/canon.root';
import { MemberInfoService } from './member-info.service';
import { CreateMemberInfoDto } from './dto/create-member-info.dto';
import { UpdateMemberInfoDto } from './dto/update-member-info.dto';
import { QueryMemberInfo } from './dto/query-member-info.dto';

@ApiTags('member_info')
@Controller('member_info')
export class MemberInfoController {
    constructor(private readonly service: MemberInfoService) {}

    @Post()
    create(@Body() createMemberInfoDto: CreateMemberInfoDto) {
        return this.service.create(createMemberInfoDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMemberInfoDto: UpdateMemberInfoDto) {
        return this.service.update(+id, updateMemberInfoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }

    @Get('/member_info_of_type')
    @ApiQuery({ name: 'basicType', enum: BasicType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findMemberInfoOfType(@Query() query: QueryMemberInfo) {
        // console.log(query);
        const { basicType, projectName } = query;
        return this.service.getMemberInfoOfType(basicType, projectName);
    }
}
