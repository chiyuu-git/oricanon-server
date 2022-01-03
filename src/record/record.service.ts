import { Injectable } from '@nestjs/common';
import { ProjectName, BasicType, RecordType, isRecordType, InfoType, DateString, Record } from '@chiyu-bit/canon.root';
import { getPrevWeeklyFetchDate, getRelativeDate } from 'src/utils';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { CharacterTagService } from './character-tag/character-tag.service';
import { CoupleTagService } from './couple-tag/couple-tag.service';
import { SeiyuuFollowerService } from './seiyuu-follower/seiyuu-follower.service';
import { RecordDataService } from './common/record-data-service';
import { CreateRecordDto } from './dto/create-record.dto';

const serviceMap = {
    [BasicType.chara]: 'characterTagService',

    [BasicType.couple]: 'coupleTagService',

    [BasicType.seiyuu]: 'seiyuuFollowerService',
};

type RelativeDate = DateString[];

interface FindRangeRecordByUnionKey {
    basicType: BasicType;
    projectName: ProjectName;
    recordType: InfoType;
    from: string;
    to: string;
}

interface FindProjectIncrementRecordOfTypeInRange {
    basicType: BasicType;
    projectName: ProjectName;
    // TODO: RecordType | AggregationType 差异很大，目前仅支持 RecordType
    recordType: RecordType;
    from?: DateString | '2020-06-06';
    // 默认值就是最新的获取日
    to?: DateString;
}

@Injectable()
export class RecordService {
    constructor(
        private readonly memberInfoService: MemberInfoService,
        // RecordDataService 总共有三种 character seiyuu couple 均实现了 RecordDataService 接口
        private readonly characterTagService: CharacterTagService,
        private readonly seiyuuFollowerService: SeiyuuFollowerService,
        private readonly coupleTagService: CoupleTagService,
    ) {}

    create({ date, recordType, romaName, record }: CreateRecordDto) {}

    /**
     * 获取 recordType 对应的 module 下，所有企划的相关数据
     * 默认维度 basicType infoType date
     */
    async findRelativeRecordOfType(
        basicType: BasicType,
        infoType: InfoType,
        endDate?: string,
    ) {
        const service = serviceMap[basicType];

        if (!service) {
            return false;
        }

        const relativeDate = await this.findRelativeDate(endDate);
        const weekRange = {
            from: relativeDate[1],
            to: relativeDate[0],
        };

        const relativeRecordOfType = await Promise.all(
            Object.values(ProjectName).map(async (projectName) => {
                const [baseRecord, lastRecord, beforeLastRecord] = await this.findProjectRelativeRecord(
                    infoType,
                    this[service],
                    projectName,
                    relativeDate,
                );
                    // ts 4.4 支持
                    // const legalRecord = baseRecord && lastRecord && beforeLastRecord;
                    // record 为 false， 则 project 为空
                if (baseRecord && lastRecord && beforeLastRecord) {
                    return {
                        projectName,
                        recordType: infoType,
                        baseRecord,
                        lastRecord,
                        beforeLastRecord,
                    };
                }
                return null;
            }),
        );

        return {
            weekRange,
            relativeRecordOfType,
        };
    }

    /**
     * 去 service 获取单个企划的数据
     */
    async findProjectRelativeRecord(
        infoType: InfoType,
        service: RecordDataService,
        projectName: ProjectName,
        relativeDate: RelativeDate,
    ) {
        if (isRecordType(infoType)) {
            return Promise.all(
                relativeDate.map((date) => service.findOneRecord({
                    projectName,
                    recordType: infoType,
                    date,
                })),
            );
        }

        return Promise.all(
            relativeDate.map((date) => service.findOneAggtRecord({
                projectName,
                aggregationType: infoType,
                date,
            })),
        );
    }

    /**
     * 根据 endDate 获取 上周及上上周的日期
     */
    private async findRelativeDate(endDate: string): Promise<DateString[]> {
        let baseDate = endDate;

        if (!baseDate) {
            // 如果 baseDate 为空，默认获取最后一条作为 baseDate
            baseDate = await this.characterTagService.findLatestWeeklyFetchDate();
        }

        return getRelativeDate(baseDate);
    }

    /**
     * 获取 baseDate 和 prevWeeklyFetchDate 两个日期，框定获取数据的范围
     */
    async findWeekRange(endDate: string) {
        let baseDate = endDate;

        if (!baseDate) {
            // 如果 baseDate 为空，默认获取最后一条作为 baseDate
            baseDate = await this.seiyuuFollowerService.findLatestDailyFetchDate();
        }

        // 从上一个获取日到 baseDate，以上一个获取日的数据作为起点
        const prevWeeklyFetchDate = getPrevWeeklyFetchDate(baseDate);

        return {
            from: prevWeeklyFetchDate,
            to: baseDate,
        };
    }

    /**
     * 通过联合主键获取指定范围内的数据
     * 默认维度 unionKey
     */
    async findRangeRecordByUnionKey({
        basicType,
        recordType,
        projectName,
        from,
        to,
    }: FindRangeRecordByUnionKey): Promise<Record[] | false> {
        const service = serviceMap[basicType];

        if (!service) {
            return false;
        }

        return this[service].findRecordInRange({
            recordType,
            projectName,
            from,
            to,
        });
    }

    /**
     * 查找历史周增数组
     * 默认维度 basicType projectName infoType
     */
    async findIncrementRecordOfTypeInRange(
        basicType: BasicType,
        projectList: ProjectName[],
        recordType: RecordType,
        from?: string,
        to?: string,
    ) {
        const incrementRecordOfTypeInRange = await Promise.all(
            projectList
                .map(async (projectName) => this.findProjectIncrementRecordOfTypeInRange({
                    basicType,
                    recordType,
                    projectName,
                    from,
                    to,
                })),
        );

        return incrementRecordOfTypeInRange;
    }

    async findProjectIncrementRecordOfTypeInRange({
        basicType,
        recordType,
        projectName,
        from = '2020-06-06',
        to,
    }: FindProjectIncrementRecordOfTypeInRange) {
        const service = serviceMap[basicType];

        if (!service) {
            return null;
        }

        let endDate = to;
        if (!endDate) {
            endDate = await this.characterTagService.findLatestWeeklyFetchDate();
        }

        const recordInRange = await (this[service] as RecordDataService).findRecordInRange({
            from,
            to: endDate,
            projectName,
            recordType,
        });

        // 倒过来获取周增数组
        const incrementRecordInRange: Record[] = [];
        let i = recordInRange.length - 1;
        let curRecord = recordInRange[i];
        while (i > 0) {
            const { date, records } = curRecord;
            const prevDate = getPrevWeeklyFetchDate(date);
            const prevRecord = recordInRange[i - 1];
            if (prevRecord.date === prevDate) {
                // 当周新增了成员时，前一周对应的 index 无值
                const incrementRecords = records.map((val, index) => {
                    const prevVal = prevRecord.records[index];
                    if (prevVal === undefined) {
                        return 0;
                    }

                    return val - prevVal;
                });
                incrementRecordInRange.unshift({
                    date,
                    records: incrementRecords,
                });
                // 更新循环条件
                curRecord = prevRecord;
                i--;
            }
            else {
                // 此时的 prevRecord 是周间统计的辅助数据，直接更新 i 即可
                i--;
            }
        }

        return {
            projectName,
            recordType,
            incrementRecordInRange,
        };
    }
}
