import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasicType, ProjectName } from '@common/root';
import { CharaRecordType } from '@common/record';
import { RecordDataService } from '../common/record-data-service';
import {
    QueryOneBasicTypeProjectRecordDto,
    QueryRangeBasicTypeProjectRecordDto,
} from '../common/dto/query-record-data.dto';
import { LLChara, LLNChara, LLSChara, LLSSChara } from './character-tag.entity';
import { MemberRecordEntity } from '../common/record.entity';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';

@Injectable()
export class CharacterTagService extends RecordDataService {
    @InjectRepository(LLChara)
    LLCharaRepository: Repository<LLChara>;

    @InjectRepository(LLSChara)
    LLSCharaRepository: Repository<LLSChara>;

    @InjectRepository(LLNChara)
    LLNCharaRepository: Repository<LLNChara>;

    @InjectRepository(LLSSChara)
    LLSSCharaRepository: Repository<LLSSChara>;

    getRepositoryByProject(projectName: ProjectName): Repository<MemberRecordEntity> {
        switch (projectName) {
            case ProjectName.ll:
                return this.LLCharaRepository;
            case ProjectName.lls:
                return this.LLSCharaRepository;
            case ProjectName.lln:
                return this.LLNCharaRepository;
            case ProjectName.llss:
                return this.LLSSCharaRepository;
            default:
                return null;
        }
    }

    createCharaRecordOfProject(createProjectCharaRecordDto: CreateRecordOfProjectDto) {
        return this.createRecordOfProject(BasicType.chara, createProjectCharaRecordDto);
    }

    /**
     * findOneCharaProjectRecord
     */
    async findOneBasicTypeProjectRecord(params: QueryOneBasicTypeProjectRecordDto): Promise<false |number[]> {
        const { recordType } = params;

        // 聚合类型 record
        switch (recordType) {
            case CharaRecordType.illustWithNovel:
                return this.findIllustWithNovel(params);
            default:
        }

        // 普通类型 record
        return this.findOneProjectRecordInDB({
            basicType: BasicType.chara,
            ...params,
        });
    }

    /**
     * 聚合 illust 和 novel，目前 character 只有一个聚合
     * 之后新增聚合此方法可以作为入口分发
     */
    async findIllustWithNovel(params: QueryOneBasicTypeProjectRecordDto): Promise<false | number[]> {
        const [illustRecords, novelRecords] = await Promise.all([
            this.findOneProjectRecordInDB({
                basicType: BasicType.chara,
                ...params,
            }),
            this.findOneProjectRecordInDB({
                basicType: BasicType.chara,
                ...params,
            }),
        ]);

        if (!illustRecords) {
            return false;
        }

        if (!novelRecords) {
            return false;
        }

        // 聚合 pixiv_illust 和 pixiv_novel
        return illustRecords.map((record, i) => record + novelRecords[i]);
    }

    async findRangeBasicTypeProjectRecord(params: QueryRangeBasicTypeProjectRecordDto) {
        // 普通类型 record
        return this.findRangeProjectRecordEntityInDB(BasicType.chara, params);
    }

    async findLatestWeeklyFetchDate() {
        const characterTag = await this.LLCharaRepository.findOne({
            order: {
                date: 'DESC',
            },
        });
        return characterTag.date;
    }
}
