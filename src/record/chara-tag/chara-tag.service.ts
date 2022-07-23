import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, ProjectName } from '@common/root';
import { CharaRecordType } from '@common/record';
import { getWeeklyFetchDate } from '@common/weekly';
import { IndexDate, MembersRecordEntity, RecordDataService } from '../common/record-data-service';
import { FindMembersRecordInRange } from '../common/dto/query-record-data.dto';
import { LLChara, LLNChara, LLSChara, LLSSChara } from './chara-tag.entity';
import { MemberRecordEntity, RestMember } from '../common/record.entity';

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

    async findMembersRecordInRange(params: FindMembersRecordInRange) {
        const { recordType } = params;

        switch (recordType) {
            // 聚合类型 record
            case CharaRecordType.illustWithNovel:
                return this.findIllustWithNovel(params);
            case CharaRecordType.favorSum:
                return this.findFavorUnion(params);
            // 普通类型 record
            default:
                return this.findMembersRangeRecordInDB(params);
        }
    }

    /**
     * 聚合 illust 和 novel
     */
    async findIllustWithNovel(params: FindMembersRecordInRange): Promise<null | MembersRecordEntity[]> {
        const [illustRecords, novelRecords] = await Promise.all([
            this.findMembersRangeRecordInDB({
                ...params,
                recordType: CharaRecordType.illust,
            }),
            this.findMembersRangeRecordInDB({
                ...params,
                recordType: CharaRecordType.novel,
            }),
        ]);

        if (!illustRecords || !novelRecords) {
            return null;
        }

        const sumRecord: MembersRecordEntity[] = [];
        const len = illustRecords.length;

        for (let indexDate: IndexDate = 0; indexDate < len; indexDate++) {
            const illustRecord = illustRecords[indexDate].records;
            const novelRecord = novelRecords[indexDate].records;

            const { date, projectName } = illustRecords[indexDate];

            sumRecord.push({
                date,
                projectName,
                recordType: CharaRecordType.illustWithNovel,
                records: illustRecord.map((record, j) => record + novelRecord[j]),
            });
        }
        return sumRecord;
    }

    /**
     * 聚合所有类型的 favor
     */
    async findFavorUnion(params: FindMembersRecordInRange): Promise<null | MembersRecordEntity[]> {
        const favorRangeRecordList = await Promise.all([
            this.findMembersRangeRecordInDB({ ...params, recordType: CharaRecordType.fifty }),
            this.findMembersRangeRecordInDB({ ...params, recordType: CharaRecordType.hundred }),
            this.findMembersRangeRecordInDB({ ...params, recordType: CharaRecordType.fiveHundred }),
            this.findMembersRangeRecordInDB({ ...params, recordType: CharaRecordType.thousand }),
            this.findMembersRangeRecordInDB({ ...params, recordType: CharaRecordType.fiveThousand }),
            this.findMembersRangeRecordInDB({ ...params, recordType: CharaRecordType.tenThousand }),
        ]);

        const [
            fiftyRecords,
            hundredRecords,
            fiveHundredRecords,
            thousandRecords,
            fiveThousandRecords,
            tenThousandRecords,
        ] = favorRangeRecordList;

        // 任意一个 records 为空都是不合法的
        // if (favorRecordList.some((records) => !records)) {
        //     return null;
        // }
        // 为了 ts 类型推导只能这样写
        if (!fiftyRecords || !hundredRecords || !fiveHundredRecords
            || !thousandRecords || !fiveThousandRecords || !tenThousandRecords) {
            return null;
        }

        const favorSumRecord: MembersRecordEntity[] = [];
        const len = fiftyRecords.length;
        const favorTypeLen = favorRangeRecordList;

        // 以 index 去组织逻辑，认为所有的 favorType 日期是对齐的，一旦爬取就是所有类型一起爬取
        // 同一个 index，相当于是同一天的数据
        for (let indexDate = 0; indexDate < len; indexDate++) {
            const record50 = fiftyRecords[indexDate].records;
            const record100 = hundredRecords[indexDate].records;
            const record500 = fiveHundredRecords[indexDate].records;
            const record1000 = thousandRecords[indexDate].records;
            const record5000 = fiveThousandRecords[indexDate].records;
            const record10000 = tenThousandRecords[indexDate].records;
            const { date, projectName } = fiftyRecords[indexDate];

            favorSumRecord.push({
                date,
                projectName,
                recordType: CharaRecordType.favorSum,
                records: record50.map((record, j) => record
                    + record100[j]
                    + record500[j]
                    + record1000[j]
                    + record5000[j]
                    + record10000[j]),
            });

            // 等价于以下这种形式：
            // const { date, recordType } = fiftyRecords[indexDate];
            // // indexDate 当天所有 favorType 的加和后的 records 数组
            // let favorSumRecordsOfIndexDate: number[] = [];
            // for (let m = 0; m < favorTypeLen.length; m++) {
            //     const favorRangeRecord = favorRangeRecordList[m];
            //     if (favorRangeRecord) {
            //         // 所有 favorType 在 index 这一天的 membersRecords
            //         const favorTypeRecordsOfIndex = favorRangeRecord[indexDate].records;
            //         favorSumRecordsOfIndexDate = favorSumRecordsOfIndexDate.map(
            //             (sumRecord, n) => sumRecord + favorTypeRecordsOfIndex[n],
            //         );
            //     }
            // }

            // favorSumRecord.push({
            //     date,
            //     recordType,
            //     records: favorSumRecordsOfIndexDate,
            // });
        }
        return favorSumRecord;
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

        return getWeeklyFetchDate(charaTag.date);
    }
}
