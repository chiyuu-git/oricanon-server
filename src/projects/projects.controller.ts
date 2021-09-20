import { Controller, Get, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project-dto';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Post()
    create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    findAll() {
        return this.projectsService.findAll();
    }

    @Get()
    @ApiQuery({ type: QueryProjectDto })
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

    @Delete(':projectName')
    @ApiQuery({ type: QueryProjectDto })
    remove(@Query() query: QueryProjectDto) {
        const { projectName, listType } = query;
        return this.projectsService.remove({ projectName, listType });
    }
}
