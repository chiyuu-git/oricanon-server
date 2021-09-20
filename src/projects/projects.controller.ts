import { Controller, Get, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project-dto';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ListType, ProjectName } from './projects.type';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Post()
    create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    // 不需要 findAll 使用 format_list_with_project 代替
    // @Get('/all_project')
    // findAll() {
    //     return this.projectsService.findAll();
    // }

    @Get('/project')
    @ApiQuery({ name: 'listType', enum: ListType })
    @ApiQuery({ name: 'projectName', enum: ProjectName })
    findOne(@Query() query: QueryProjectDto) {
        const { projectName, listType } = query;
        return this.projectsService.findOne({ projectName, listType });
    }

    @Patch()
    @ApiBody({ type: UpdateProjectDto })
    update(@Body() UpdateProjectDto: UpdateProjectDto) {
        // 要么是路由带上多个param
        // 要么是从body中取
        const { projectName, listType } = UpdateProjectDto;
        return this.projectsService.update({ projectName, listType }, UpdateProjectDto);
    }

    @Delete()
    @ApiQuery({ type: QueryProjectDto })
    remove(@Query() query: QueryProjectDto) {
        const { projectName, listType } = query;
        return this.projectsService.remove({ projectName, listType });
    }

    /**
     * 返回所有listType类型的list
     */
    @Get('list_of_type')
    @ApiQuery({ name: 'listType', enum: ListType })
    async findListOfType(@Query('listType') listType: ListType) {
        if (ListType[listType]) {
            const projectOfTypeList = await this.projectsService.findListByType({ listType });
            return `find all list of ${listType} ${JSON.stringify(projectOfTypeList)}`;
        }
        else {
            return `type ${listType} not exist`;
        }
    }

    /**
     * 以 projectName 为主要字段整合全部 project ，并返回
     */
    @Get('format_list_with_project')
    async formatListWithProject() {
        const projects = await this.projectsService.findAll();
    }
}
