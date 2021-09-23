import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberListType, ListType } from './member-lists.type';
import { CreateMemberListDto } from './dto/create-member-list.dto';
import { QueryMemberListDto } from './dto/query-member-list-dto';
import { UpdateMemberListDto } from './dto/update-member-list.dto';
import { MemberList } from './entities/member-list.entity';

@Injectable()
export class MemberListsService {
    constructor(
        @InjectRepository(MemberList)
        private MemberListsRepository: Repository<MemberList>,
    ) {}

    async findAll() {
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

    async findListByType<T extends keyof MemberListType>(type: T): Promise<MemberListType[T][]> {
        const memberList = await this.MemberListsRepository.find({
            select: ['projectName', 'list'],
            where: { type },
        });
        /**
         * TODO: 这里使用了一个强制断言，看下是否有更好的方法实现
         */
        return memberList as unknown as MemberListType[T][];
    }
}
