import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BasicType, ProjectName } from '@chiyu-bit/canon.root';
import { Repository } from 'typeorm';
import { CreateMemberInfoDto } from './dto/create-member-info.dto';
import { UpdateMemberInfoDto } from './dto/update-member-info.dto';
import { CharaInfo } from './entities/chara-info.entity';
import { CoupleInfo } from './entities/couple-info.entity';
import { SeiyuuInfo } from './entities/seiyuu-info.entity';

type MemberInfoOfType<Type extends BasicType> = Type extends BasicType.character
    ? CharaInfo[]
    : Type extends BasicType.couple
        ? CoupleInfo[]
        : Type extends BasicType.seiyuu
            ? SeiyuuInfo[]
            : never

@Injectable()
export class MemberInfoService {
    constructor(
        @InjectRepository(CharaInfo)
        private charaRepository: Repository<CharaInfo>,
        @InjectRepository(SeiyuuInfo)
        private seiyuuRepository: Repository<SeiyuuInfo>,
        @InjectRepository(CoupleInfo)
        private coupleRepository: Repository<CoupleInfo>,
    ) {}

    create(createMemberInfoDto: CreateMemberInfoDto) {
        return 'This action adds a new memberInfo';
    }

    update(id: number, updateMemberInfoDto: UpdateMemberInfoDto) {
        return `This action updates a #${id} memberInfo`;
    }

    remove(id: number) {
        return `This action removes a #${id} memberInfo`;
    }

    async getMemberInfoOfType<Type extends BasicType>(
        basicType: Type,
        projectName: ProjectName,
    ): Promise<MemberInfoOfType<Type>> {
        switch (basicType) {
            case BasicType.character:
                return this.charaRepository.find({
                    where: { projectName },
                });
            case BasicType.seiyuu:
                return this.seiyuuRepository.find({
                    where: { projectName },
                });
            case BasicType.couple:
                return this.coupleRepository.find({
                    where: { projectName },
                });
            default:
                return null;
        }
    }
}
