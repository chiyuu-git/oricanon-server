import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectDto } from './dto/query-project-dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
    ) {}

    async create(CreateProjectDto: CreateProjectDto) {
        await this.projectsRepository.insert(CreateProjectDto);
        return 'This action adds a new project';
    }

    async findAll() {
        const project = await this.projectsRepository.find();
        return `This action returns all ${JSON.stringify(project)}`;
    }

    async findOne({ projectName, listType }: QueryProjectDto) {
        const project = await this.projectsRepository.findOne({
            projectName,
            listType,
        });
        return `This action returns a #${JSON.stringify(project)} project`;
    }

    async update({ projectName, listType }: UpdateProjectDto, UpdateProjectDto: UpdateProjectDto) {
        const project = await this.projectsRepository.update({ projectName, listType }, UpdateProjectDto);
        // 执行 UPDATE user SET firstName = Rizzrak WHERE firstName = Timber
        return `This action updates ${JSON.stringify(project)}`;
    }

    remove({ projectName, listType }: QueryProjectDto) {
        // TODO: 添加废除标记
        return `This action removes a #${projectName} ${listType} project`;
    }
}
