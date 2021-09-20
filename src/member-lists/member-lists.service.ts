import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectName, ListFormatWithProject } from './member-lists.type';
import { CreateMemberListDto } from './dto/create-member-list.dto';
import { QueryMemberListDto } from './dto/query-member-list-dto';
import { UpdateMemberListDto } from './dto/update-member-list.dto';
import { MemberList } from './entities/member-list.entity';

/**
 * 中间变量，以 projectName 为属性名整合全部的list
 */
type ProjectMap = Record<ProjectName, Partial<ListFormatWithProject>>;

@Injectable()
export class MemberListsService {
    constructor(
        @InjectRepository(MemberList)
        private MemberListsRepository: Repository<MemberList>,
    ) {}

    private async findAll() {
        return this.MemberListsRepository.find();
    }

    async create(CreateProjectDto: CreateMemberListDto) {
        await this.MemberListsRepository.insert(CreateProjectDto);
        return 'This action adds a new memberList';
    }

    async findOne({ projectName, type }: QueryMemberListDto) {
        const memberList = await this.MemberListsRepository.findOne({
            select: ['projectName', 'list'],
            where: {
                projectName,
                type,
            },
        });
        return `This action returns a memberList: #${JSON.stringify(memberList)}`;
    }

    async update({ projectName, type }: UpdateMemberListDto, updateProjectDto: UpdateMemberListDto) {
        const memberList = await this.MemberListsRepository.update({ projectName, type }, updateProjectDto);
        // 执行 UPDATE user SET firstName = Rizzrak WHERE firstName = Timber
        return `This action updates ${JSON.stringify(memberList)}`;
    }

    remove({ projectName, type }: QueryMemberListDto) {
        // TODO: 添加废除标记
        return `This action removes a #${projectName} ${type} memberList`;
    }

    /**
     * 以下均为扩展能力，基于基础的 service 扩展
     */
    async findListByType({ type }: QueryMemberListDto) {
        const memberList = await this.MemberListsRepository.find({
            select: ['projectName', 'list'],
            where: { type },
        });
        return memberList;
    }

    /**
     * 以 projectName 为主要字段整合memberList
     * TODO: 这里第二个 as 断言， 是否有更好的处理方法
     */
    async formatListWithProject() {
        const memberLists = await this.findAll();
        const formatList: ListFormatWithProject[] = [];
        const projectMap: ProjectMap = {} as ProjectMap;
        for (const memberList of memberLists) {
            const { projectName, type, list } = memberList;
            if (projectMap[projectName]) {
                projectMap[projectName][`${type}s`] = list;
            }
            else {
                projectMap[projectName] = {
                    projectName,
                    [`${type}s`]: list,
                };
            }
        }

        for (const memberList of Object.values(projectMap)) {
            formatList.push(memberList as ListFormatWithProject);
        }
        return formatList;
    }
}
