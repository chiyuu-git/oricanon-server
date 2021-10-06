import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListType, MemberListMap } from './member-list.type';
import { CreateMemberListDto } from './dto/create-member-list.dto';
import { QueryMemberListDto } from './dto/query-member-list-dto';
import { UpdateMemberListDto } from './dto/update-member-list.dto';
import { MemberList } from './entities/member-list.entity';
import type { ListFormatWithProject, ProjectName } from './member-list.type';

/**
 * 中间变量，以 projectName 为属性名整合全部的list
 */
 type ProjectMap = Record<ProjectName, Partial<ListFormatWithProject>>;

@Injectable()
export class MemberListService {
    constructor(
        @InjectRepository(MemberList)
        private repository: Repository<MemberList>,
    ) {}

    async create(CreateProjectDto: CreateMemberListDto) {
        await this.repository.insert(CreateProjectDto);
        return 'This action adds a new memberList';
    }

    async findAll() {
        return this.repository.find();
    }

    async findOne({ projectName, type }: QueryMemberListDto) {
        const memberList = await this.repository.findOne({
            select: ['projectName', 'list'],
            where: {
                projectName,
                type,
            },
        });
        return memberList;
    }

    async update({ projectName, type }: UpdateMemberListDto, updateProjectDto: UpdateMemberListDto) {
        const memberList = await this.repository.update({ projectName, type }, updateProjectDto);
        // 执行 UPDATE user SET firstName = Rizzrak WHERE firstName = Timber
        return `This action updates ${JSON.stringify(memberList)}`;
    }

    remove({ projectName, type }: QueryMemberListDto) {
        // TODO: 添加废除标记
        return `This action removes a #${projectName} ${type} memberList`;
    }

    async findListByType<T extends keyof MemberListMap>(type: T): Promise<MemberListMap[T][]> {
        const memberList = await this.repository.find({
            select: ['projectName', 'list'],
            where: { type },
        });
        /**
         * TODO: 这里使用了一个强制断言，看下是否有更好的方法实现
         */
        return memberList as unknown as MemberListMap[T][];
    }

    /**
     * 获取所有角色的Tags
     */
    async findAllCharacterTags() {
        const characterLists = await this.findListByType(ListType.character);
        const allCharacterTags = characterLists.map(({ projectName, list }) => {
            const pixivTags = list.map(({ pixivTag }) => pixivTag);
            return {
                projectName,
                pixivTags,
            };
        });
        return allCharacterTags;
    }

    /**
     * 获取所有角色cp的Tags
     */
    async findAllCoupleTags() {
        const coupleLists = await this.findListByType(ListType.characterCouple);
        const allCoupleTags = coupleLists.map(({ projectName, list }) => {
            const tags: string[] = [];
            const reverseTags: string[] = [];
            const intersectionTags: string[] = [];
            for (const { pixivTag, pixivReverseTag } of list) {
                tags.push(pixivTag);
                if (pixivReverseTag) {
                    reverseTags.push(pixivReverseTag);
                    intersectionTags.push(`${pixivTag} ${pixivReverseTag}`);
                }
            }
            return {
                projectName,
                pixivTags: tags,
                pixivReverseTags: reverseTags,
                pixivIntersectionTags: intersectionTags,
            };
        });
        return allCoupleTags;
    }

    /**
     * 以 projectName 为主要字段整合全部 memberList
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
