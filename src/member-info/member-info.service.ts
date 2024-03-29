import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category, ProjectName } from '@common/root';
import { MemberInfoMap, GetMemberInfoByCategory, MemberCommonInfo, FindMembersOptions } from '@common/member-info';
import { Repository } from 'typeorm';
import { CharaInfo } from './entities/chara-info.entity';
import { CoupleInfo } from './entities/couple-info.entity';
import { PersonInfo } from './entities/person-info.entity';
import { MemberInfo } from './entities/member-info.entity';
import { Members } from './entities/member-list.entity';

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

const defaultFindMembersOptions = {
    onlyActive: true,
};

@Injectable()
export class MemberInfoService {
    constructor(
        @InjectRepository(CharaInfo)
        private MembersRepository: Repository<Members>,
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
    ): Promise<GetMemberInfoByCategory<Type>>
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

    /**
     * 核心查询方法，查询 category 下的所有 memberInfo
     */
    findMembersOfCategory<Type extends Category>(
        type: Type,
        options?: FindMembersOptions
    ): Promise<GetMemberInfoByCategory<Type>[]>
    findMembersOfCategory(type: Category, { onlyActive }: FindMembersOptions = defaultFindMembersOptions) {
        const repository = this.getRepositoryByType(type);

        return onlyActive
            ? repository.find({ where: { isActive: true } })
            : repository.find();
    }

    /**
     * 核心查询方法，查询 category 和 project 下的 memberInfo
     */
    findProjectMembersOfCategory<Type extends Category>(
        category: Type,
        projectName: ProjectName,
        options?: FindMembersOptions
    ): Promise<GetMemberInfoByCategory<Type>[]>
    findProjectMembersOfCategory(
        category: Category,
        projectName: ProjectName,
        { onlyActive }: FindMembersOptions = defaultFindMembersOptions,
    ) {
        const repository = this.getRepositoryByType(category);

        return onlyActive
            ? repository.find({ where: { projectName, isActive: true } })
            : repository.find({ where: { projectName } });
    }

    /**
     * 获取基础类型的 memberInfoMap，以 romaName 为 key
     */
    async findMemberInfoMapOfCategory<Type extends Category>(type: Type, options?: FindMembersOptions) {
        const memberInfoList = await this.findMembersOfCategory(type, options);
        const memberInfoMap = <MemberInfoMap<Type>>{};
        for (const memberInfo of memberInfoList) {
            const { romaName } = memberInfo;
            memberInfoMap[romaName] = memberInfo;
        }
        return memberInfoMap;
    }
}
