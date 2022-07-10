import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category, ProjectName } from '@common/root';
import { MemberInfoMap, GetMemberInfoByType, MemberCommonInfo } from '@common/member-info';
import { Repository } from 'typeorm';
import { CharaInfo } from './entities/chara-info.entity';
import { CoupleInfo } from './entities/couple-info.entity';
import { PersonInfo } from './entities/person-info.entity';
import { MemberInfo } from './entities/member-info.entity';
import { ProjectMemberListKey, ProjectMemberListMap } from './common';
import { MemberList } from './entities/member-list.entity';

type ProjectCharaTagListMap = Record<ProjectName, {
    projectName: ProjectName;
    pixivTags: string[];
}>
type ProjectPersonTwitterAccountListMap = Record<ProjectName, {
    projectName: ProjectName;
    twitterAccounts: string[];
}>
type ProjectCoupleTagListMap = Record<ProjectName, {
    projectName: ProjectName;
    pixivTags: string[];
    pixivReverseTags: string[];
    pixivIntersectionTags: string[];
}>

@Injectable()
export class MemberInfoService {
    constructor(
        @InjectRepository(CharaInfo)
        private MemberListRepository: Repository<MemberList>,
        @InjectRepository(CharaInfo)
        private charaRepository: Repository<CharaInfo>,
        @InjectRepository(PersonInfo)
        private personRepository: Repository<PersonInfo>,
        @InjectRepository(CoupleInfo)
        private coupleRepository: Repository<CoupleInfo>,
    ) {}

    getRepositoryByType(category: Category): Repository<MemberInfo> {
        switch (category) {
            case Category.chara:
                return this.charaRepository;
            case Category.person:
                return this.personRepository;
            case Category.couple:
                return this.coupleRepository;
            default:
                throw new HttpException(`Repository of ${category} not exist`, HttpStatus.NOT_FOUND);
        }
    }

    findMemberInfoByRomaName<Type extends Category>(
        category: Type,
        romaName: string,
    ): Promise<GetMemberInfoByType<Type>>
    async findMemberInfoByRomaName(category: Category, romaName: string) {
        const repository = this.getRepositoryByType(category);

        const member = await repository.findOne({
            where: { romaName },
        });

        if (!member) {
            throw new HttpException(`Can not find member ${romaName}`, HttpStatus.NOT_FOUND);
        }

        return member;
    }

    async findPersonInfoByTwitterAccount(twitterAccount: string) {
        const repository = this.personRepository;

        const member = await repository.findOne({
            where: { twitterAccount },
        });

        if (!member) {
            throw new HttpException(`Can not find member ${twitterAccount}`, HttpStatus.NOT_FOUND);
        }

        return member;
    }

    findProjectMemberInfoByCategory<Type extends Category>(
        category: Type,
        projectName: ProjectName,
    ): Promise<GetMemberInfoByType<Type>[]>
    findProjectMemberInfoByCategory(
        category: Category,
        projectName: ProjectName,
    ) {
        const repository = this.getRepositoryByType(category);

        return repository.find({
            where: { projectName },
        });
    }

    findMemberInfoListByCategory<Type extends Category>(type: Type): Promise<GetMemberInfoByType<Type>[]>
    findMemberInfoListByCategory(type: Category) {
        const repository = this.getRepositoryByType(type);

        return repository.find();
    }

    /**
     * 获取所有 角色 的 tag
     */
    async findCharaTagList() {
        const charaList = await this.findMemberInfoListByCategory(Category.chara);
        const charaTagList: ProjectCharaTagListMap = {} as ProjectCharaTagListMap;

        for (const charaInfo of charaList) {
            const { projectName, pixivTag } = charaInfo;
            let listOfProject = charaTagList[projectName];

            if (!listOfProject) {
                listOfProject = {
                    projectName,
                    pixivTags: [],
                };

                charaTagList[projectName] = listOfProject;
            }

            listOfProject.pixivTags.push(pixivTag);
        }

        return Object.values(charaTagList);
    }

    /**
     * 获取所有 person 的 twitter account
     */
    async findPersonTwitterAccountList() {
        const personList = await this.findMemberInfoListByCategory(Category.person);
        const personTwitterAccountList: ProjectPersonTwitterAccountListMap = {} as ProjectPersonTwitterAccountListMap;

        for (const personInfo of personList) {
            const { projectName, twitterAccount } = personInfo;
            let listOfProject = personTwitterAccountList[projectName];

            if (!listOfProject) {
                listOfProject = {
                    projectName,
                    twitterAccounts: [],
                };

                personTwitterAccountList[projectName] = listOfProject;
            }

            listOfProject.twitterAccounts.push(twitterAccount);
        }

        return Object.values(personTwitterAccountList);
    }

    /**
     * 获取所有 couple 的 tag
     */
    async findCoupleTagList() {
        const coupleList = await this.findMemberInfoListByCategory(Category.couple);
        const coupleTagList: ProjectCoupleTagListMap = {} as ProjectCoupleTagListMap;

        for (const charaInfo of coupleList) {
            const { projectName, pixivTag, pixivReverseTag } = charaInfo;
            let listOfProject = coupleTagList[projectName];

            if (!listOfProject) {
                listOfProject = {
                    projectName,
                    pixivTags: [],
                    pixivReverseTags: [],
                    pixivIntersectionTags: [],
                };

                coupleTagList[projectName] = listOfProject;
            }

            listOfProject.pixivTags.push(pixivTag);
            listOfProject.pixivReverseTags.push(pixivReverseTag);
            listOfProject.pixivIntersectionTags.push(`${pixivTag} ${pixivReverseTag}`);
        }

        return Object.values(coupleTagList);
    }

    /**
     * 以 projectName 为 key 整合 memberList``
     */
    async formatListWithProject() {
        const projectMemberListMap = <ProjectMemberListMap>{};

        const pendingFormatters = Object.values(Category).map((type) => {
            const pendingFormatter = this.findMemberInfoListByCategory(type)
                .then((memberInfoList) => {
                    for (const memberInfo of memberInfoList) {
                        const { projectName } = memberInfo;
                        const listType: ProjectMemberListKey = `${type}s`;
                        let projectMemberList = projectMemberListMap[projectName];

                        if (!projectMemberList) {
                            projectMemberList = {
                                charas: [],
                                projectName,
                            };
                            projectMemberListMap[projectName] = projectMemberList;
                        }

                        if (!projectMemberList[listType]) {
                            projectMemberList[listType] = [];
                        }
                        // 函数内部类型没必要过窄，只需要返回值类型是明确的即可
                        (projectMemberList[listType] as MemberInfo[])?.push(memberInfo);
                    }
                    return true;
                })
                .catch((error) => console.error(error));
            return pendingFormatter;
        });

        await Promise.all(pendingFormatters);

        return projectMemberListMap;
    }

    /**
     * 获取基础类型的 memberInfoMap，以 romaName 为 key
     */
    async findMemberInfoMapOfType<Type extends Category>(type: Type) {
        const memberInfoList = await this.findMemberInfoListByCategory(type);
        const memberInfoMap = <MemberInfoMap<Type>>{};
        for (const memberInfo of memberInfoList) {
            const { romaName } = memberInfo;
            memberInfoMap[romaName] = memberInfo;
        }
        return memberInfoMap;
    }
}
