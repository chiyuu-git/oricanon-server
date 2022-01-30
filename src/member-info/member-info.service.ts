import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasicType, ProjectName } from '@common/root';
import { MemberInfoMap, GetMemberInfoByType } from '@common/member-info';
import { Repository } from 'typeorm';
import { CharaInfo } from './entities/chara-info.entity';
import { CoupleInfo } from './entities/couple-info.entity';
import { SeiyuuInfo } from './entities/seiyuu-info.entity';
import { MemberInfo } from './entities/member-info.entity';
import { ProjectMemberListKey, ProjectMemberListMap } from './common';
import { MemberList } from './entities/member-list.entity';

type ProjectCharaTagListMap = Record<ProjectName, {
    projectName: ProjectName;
    pixivTags: string[];
}>
type ProjectSeiyuuTwitterAccountListMap = Record<ProjectName, {
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
        @InjectRepository(SeiyuuInfo)
        private seiyuuRepository: Repository<SeiyuuInfo>,
        @InjectRepository(CoupleInfo)
        private coupleRepository: Repository<CoupleInfo>,
    ) {}

    getRepositoryByType(basicType: BasicType): Repository<MemberInfo> {
        switch (basicType) {
            case BasicType.chara:
                return this.charaRepository;
            case BasicType.seiyuu:
                return this.seiyuuRepository;
            case BasicType.couple:
                return this.coupleRepository;
            default:
                throw new HttpException(`Repository of ${basicType} not exist`, HttpStatus.NOT_FOUND);
        }
    }

    async findMemberInfoByRomaName(romaName: string) {
        const member = await this.MemberListRepository.findOne({
            where: { romaName },
        });

        if (!member) {
            throw new HttpException(`Can not find member ${romaName}`, HttpStatus.NOT_FOUND);
        }

        return member.memberId;
    }

    findMemberInfoByTypeAndProject<Type extends BasicType>(
        basicType: Type,
        projectName: ProjectName,
    ): Promise<GetMemberInfoByType<Type>[]>
    findMemberInfoByTypeAndProject(
        basicType: BasicType,
        projectName: ProjectName,
    ) {
        const repository = this.getRepositoryByType(basicType);

        return repository.find({
            where: { projectName },
        });
    }

    findMemberInfoListByType<Type extends BasicType>(type: Type): Promise<GetMemberInfoByType<Type>[]>
    findMemberInfoListByType(type: BasicType) {
        const repository = this.getRepositoryByType(type);

        return repository.find();
    }

    /**
     * 获取所有 角色 的 tag
     */
    async findCharaTagList() {
        const charaList = await this.findMemberInfoListByType(BasicType.chara);
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
     * 获取所有 seiyuu 的 twitter account
     */
    async findSeiyuuTwitterAccountList() {
        const seiyuuList = await this.findMemberInfoListByType(BasicType.seiyuu);
        const seiyuuTwitterAccountList: ProjectSeiyuuTwitterAccountListMap = {} as ProjectSeiyuuTwitterAccountListMap;

        for (const seiyuuInfo of seiyuuList) {
            const { projectName, twitterAccount } = seiyuuInfo;
            let listOfProject = seiyuuTwitterAccountList[projectName];

            if (!listOfProject) {
                listOfProject = {
                    projectName,
                    twitterAccounts: [],
                };

                seiyuuTwitterAccountList[projectName] = listOfProject;
            }

            listOfProject.twitterAccounts.push(twitterAccount);
        }

        return Object.values(seiyuuTwitterAccountList);
    }

    /**
     * 获取所有 couple 的 tag
     */
    async findCoupleTagList() {
        const coupleList = await this.findMemberInfoListByType(BasicType.couple);
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

        const pendingFormatters = Object.values(BasicType).map((type) => {
            const pendingFormatter = this.findMemberInfoListByType(type)
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
    async findMemberInfoMapOfType<Type extends BasicType>(type: Type) {
        const memberInfoList = await this.findMemberInfoListByType(type);
        const memberInfoMap = <MemberInfoMap<Type>>{};
        for (const memberInfo of memberInfoList) {
            const { romaName } = memberInfo;
            memberInfoMap[romaName] = memberInfo;
        }
        return memberInfoMap;
    }
}
