import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, ProjectName } from '@common/root';
import { CharaRecordType } from '@common/record';
import { RecordDataService } from '../common/record-data-service';
import {
    FindMemberListRecordInRange,
    QueryMemberListRecordInCategory,
} from '../common/dto/query-record-data.dto';
import { LLChara, LLNChara, LLSChara, LLSSChara } from './chara-tag.entity';
import { MemberRecordEntity, RestMember } from '../common/record.entity';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';

@Injectable()
export class CharaTagService extends RecordDataService {
    category = Category.chara;

    @InjectRepository(LLChara)
    LLCharaRepository: Repository<LLChara>;

    @InjectRepository(LLSChara)
    LLSCharaRepository: Repository<LLSChara>;

    @InjectRepository(LLNChara)
    LLNCharaRepository: Repository<LLNChara>;

    @InjectRepository(LLSSChara)
    LLSSCharaRepository: Repository<LLSSChara>;

    @InjectRepository(RestMember)
    RestMemberRepository: Repository<RestMember>;

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
                return this.RestMemberRepository;
        }
    }

    /**
     * findOneCharaProjectRecord
     */
    async findMemberListRecord(params: QueryMemberListRecordInCategory): Promise<null |number[]> {
        const { recordType } = params;

        switch (recordType) {
            // 聚合类型 record
            case CharaRecordType.illustWithNovel:
                return this.findIllustWithNovel(params);
            case CharaRecordType.favorSum:
                return this.findFavorUnion(params);
            // 普通类型 record
            default:
                return this.findMemberListRecordInDB(params);
        }
    }

    /**
     * 聚合 illust 和 novel
     */
    async findIllustWithNovel(params: QueryMemberListRecordInCategory): Promise<null | number[]> {
        const [illustRecords, novelRecords] = await Promise.all([
            this.findMemberListRecordInDB({
                ...params,
                recordType: CharaRecordType.illust,
            }),
            this.findMemberListRecordInDB({
                ...params,
                recordType: CharaRecordType.novel,
            }),
        ]);

        if (!illustRecords || !novelRecords) {
            return null;
        }

        // 聚合 pixiv_illust 和 pixiv_novel
        return illustRecords.map((record, i) => record + novelRecords[i]);
    }

    /**
     * 聚合所有类型的 favor
     */
    async findFavorUnion(params: QueryMemberListRecordInCategory): Promise<null | number[]> {
        const [
            fiftyRecords,
            hundredRecords,
            fiveHundredRecords,
            thousandRecords,
            fiveThousandRecords,
            tenThousandRecords,
        ] = await Promise.all([
            this.findMemberListRecordInDB({ ...params, recordType: CharaRecordType.fifty }),
            this.findMemberListRecordInDB({ ...params, recordType: CharaRecordType.hundred }),
            this.findMemberListRecordInDB({ ...params, recordType: CharaRecordType.fiveHundred }),
            this.findMemberListRecordInDB({ ...params, recordType: CharaRecordType.thousand }),
            this.findMemberListRecordInDB({ ...params, recordType: CharaRecordType.fiveThousand }),
            this.findMemberListRecordInDB({ ...params, recordType: CharaRecordType.tenThousand }),
        ]);

        if (!fiftyRecords || !hundredRecords || !fiveHundredRecords
            || !thousandRecords || !fiveThousandRecords || !tenThousandRecords) {
            return null;
        }

        // 聚合 pixiv_illust 和 pixiv_novel
        return fiftyRecords.map((record, i) => record
            + hundredRecords[i]
            + fiveHundredRecords[i]
            + thousandRecords[i]
            + fiveThousandRecords[i]
            + tenThousandRecords[i]);
    }

    async findMemberListRecordInRange(params: FindMemberListRecordInRange) {
        // 普通类型 record
        return this.findRangeProjectRecordInDB(params);
    }

    async findLatestWeeklyFetchDate() {
        const charaTag = await this.LLCharaRepository.findOne({
            order: {
                date: 'DESC',
            },
        });

        if (!charaTag) {
            throw new HttpException('Can not find latest weekly fetch date', HttpStatus.NOT_FOUND);
        }

        return charaTag.date;
    }
}
