import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasicType } from '@chiyu-bit/canon.root';
import { MemberListTypeMap, ProjectMemberListMap } from './member-list.type';
import { CreateMemberListDto } from './dto/create-member-list.dto';
import { QueryMemberListDto } from './dto/query-member-list-dto';
import { UpdateMemberListDto } from './dto/update-member-list.dto';
import { MemberList } from './entities/member-list.entity';

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
        return `This action removes a #${projectName} ${type} memberList`;
    }

    async findListByType<T extends keyof MemberListTypeMap>(type: T): Promise<MemberListTypeMap[T][]> {
        const memberList = await this.repository.find({
            select: ['projectName', 'list'],
            where: { type },
        });
        /**
         * TODO: 这里使用了一个强制断言，看下是否有更好的方法实现
         */
        return memberList as unknown as MemberListTypeMap[T][];
    }

    /**
     * 获取所有角色的Tags
     */
    async findAllCharacterTags() {
        const characterLists = await this.findListByType(BasicType.character);
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
        const coupleLists = await this.findListByType(BasicType.couple);
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
     */
    async formatListWithProject() {
        const memberLists = await this.findAll();
        const projectMemberListMap: ProjectMemberListMap = {} as ProjectMemberListMap;
        for (const memberList of memberLists) {
            const { projectName, type, list } = memberList;
            if (projectMemberListMap[projectName]) {
                projectMemberListMap[projectName][`${type}s`] = list;
            }
            else {
                projectMemberListMap[projectName] = {
                    projectName,
                    [`${type}s`]: list,
                };
            }
        }
        return projectMemberListMap;
    }
}
