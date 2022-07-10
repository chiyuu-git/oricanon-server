import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProjectName, Category, DateString } from '@common/root';
import { RecordType, ProjectRecord, MemberRecord } from '@common/record';
import { getPrevWeeklyFetchDate, getRelativeDate } from '@common/weekly';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { getPercentile } from '@utils/math';
import { CharaTagService } from './chara-tag/chara-tag.service';
import { CoupleTagService } from './couple-tag/couple-tag.service';
import { PersonFollowerService } from './person/person.service';
import { RecordDataService } from './common/record-data-service';
import {
    QueryMemberRecordInRange,
    QueryOneProjectRecord,
    QueryProjectRecordInRange,
} from './common/dto/query-record-data.dto';

type RelativeDate = DateString[];

@Injectable()
export class RecordService {
    constructor(
        private readonly memberInfoService: MemberInfoService,
        // RecordDataService 总共有三种 chara person couple 均实现了 RecordDataService 接口
        private readonly charaTagService: CharaTagService,
        private readonly coupleTagService: CoupleTagService,
        private readonly personFollowerService: PersonFollowerService,
    ) {}

    getServiceByCategory(category: Category) {
        switch (category) {
            case Category.chara:
                return this.charaTagService;
            case Category.couple:
                return this.coupleTagService;
            case Category.person:
                return this.personFollowerService;
            default:
                throw new HttpException(`Service of ${category} not exist`, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * 调用 service 的方法时可以省略 to，由此方法统一返回 endDate
     */
    async getDefaultEndDate(to?: string) {
        let endDate = to;
        if (!endDate) {
            endDate = await this.charaTagService.findLatestWeeklyFetchDate();
        }
        return endDate;
    }

    /**
     * 去 service 获取单个企划的数据
     */
    async findOneProjectRecord({
        category,
        recordType,
        projectName,
        date,
    }: QueryOneProjectRecord) {
        const targetDate = await this.getDefaultEndDate(date);

        return this.getServiceByCategory(category).findOneProjectRecord({
            projectName,
            recordType,
            date: targetDate,
        });
    }

    /**
     * 获取指定 category 和 recordType 下所有企划的周相关数据
     */
    async findWeeklyRelativeRecord(
        category: Category,
        recordType: RecordType,
        endDate?: string,
    ) {
        const relativeDate = await this.findRelativeDate(endDate);
        const weekRange = {
            from: relativeDate[1],
            to: relativeDate[0],
        };

        const relativeRecordOfType = await Promise.all(
            Object.values(ProjectName).map(async (projectName) => {
                const [baseRecord, lastRecord, beforeLastRecord] = await this.findProjectRelativeRecord(
                    recordType,
                    this.getServiceByCategory(category),
                    projectName,
                    relativeDate,
                );
                // ts 4.4 支持
                // const legalRecord = baseRecord && lastRecord && beforeLastRecord;
                // record 为 false， 则 project 为空
                if (baseRecord && lastRecord && beforeLastRecord) {
                    return {
                        projectName,
                        recordType,
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
        recordType: RecordType,
        service: RecordDataService,
        projectName: ProjectName,
        relativeDate: RelativeDate,
    ) {
        return Promise.all(
            relativeDate.map((date) => service.findOneProjectRecord({
                projectName,
                recordType,
                date,
            })),
        );
    }

    /**
     * 根据 endDate 获取 上周及上上周的日期
     */
    private async findRelativeDate(endDate?: string): Promise<DateString[]> {
        let baseDate = endDate;

        if (!baseDate) {
            // 如果 baseDate 为空，默认获取最后一条作为 baseDate
            baseDate = await this.charaTagService.findLatestWeeklyFetchDate();
        }

        return getRelativeDate(baseDate);
    }

    /**
     * 获取 baseDate 和 prevWeeklyFetchDate 两个日期，框定获取数据的范围
     */
    async findWeekRange(endDate?: string) {
        let baseDate = endDate;

        if (!baseDate) {
            // 如果 baseDate 为空，默认获取最后一条作为 baseDate
            baseDate = await this.personFollowerService.findLatestDailyFetchDate();
        }

        // 从上一个获取日到 baseDate，以上一个获取日的数据作为起点
        const prevWeeklyFetchDate = getPrevWeeklyFetchDate(baseDate);

        return {
            from: prevWeeklyFetchDate,
            to: baseDate,
        };
    }

    async findProjectRecordInRange({
        category,
        recordType,
        from,
        to,
        projectName,
    }: QueryProjectRecordInRange) {
        const endDate = await this.getDefaultEndDate(to);

        return this.getServiceByCategory(category).findProjectRecordInRange({
            recordType,
            projectName,
            from,
            to: endDate,
        });
    }

    /**
     * 查找历史周增数组
     * 没有指定 project 或 member，默认以 project 维度返回所有数据
     */
    async findAllProjectWeekIncrementInRange(
        category: Category,
        recordType: RecordType,
        projectList: ProjectName[],
        from: string,
        to?: string,
    ) {
        const allProjectIncrementRecordInRange = await Promise.all(
            projectList
                .map(async (projectName) => this.findProjectWeekIncrementInRange({
                    category,
                    recordType,
                    from,
                    to,
                    projectName,
                })),
        );

        return allProjectIncrementRecordInRange;
    }

    /**
     * 周增数据是可以由现有数据计算得出的，因此不应该放在外部的 service
     */
    async findProjectWeekIncrementInRange({
        category,
        recordType,
        from,
        to,
        projectName,
    }: QueryProjectRecordInRange) {
        const endDate = await this.getDefaultEndDate(to);

        const recordInRange = await this.getServiceByCategory(category).findProjectRecordInRange({
            from,
            to: endDate,
            projectName,
            recordType,
        });

        if (!recordInRange) {
            return null;
        }

        // 倒过来获取周增数组
        const incrementRecordInRange: ProjectRecord[] = [];
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
                        // 如果成员在记录之前就已经有 100 份数据，此时若返回 val - 0 ，则相当于是周增了 100
                        // 因此若之前没有改成员的记录，周增一律为 0
                        return 0;
                    }

                    return val - prevVal;
                });
                // 计算企划周增的平均值、50分位 and more
                const average = Math.round(incrementRecords.reduce((acc, val) => acc + val) / incrementRecords.length);
                // 计算中位数
                const median = getPercentile([...incrementRecords].sort((a, b) => a - b), 50);
                // console.log('incrementRecords:', incrementRecords);
                // console.log('average:', average);
                incrementRecordInRange.unshift({
                    date,
                    records: incrementRecords,
                    average,
                    median,
                });
                // 更新循环条件
                curRecord = prevRecord;
                i--;
            }
            else {
                // 此时的 prevRecord 是周间统计的插值数据，直接更新 i 即可
                i--;
            }
        }

        return {
            projectName,
            incrementRecordInRange,
        };
    }

    async findMemberWeekIncrementInRange({
        category,
        recordType,
        from,
        to,
        romaName,
    }: QueryMemberRecordInRange) {
        const endDate = await this.getDefaultEndDate(to);

        const recordInRange = await this.getServiceByCategory(category).findMemberRecordInRange({
            from,
            to: endDate,
            romaName,
            recordType,
        });

        const incrementRecordInRange: MemberRecord[] = [];
        let i = recordInRange.length - 1;
        let curRecord = recordInRange[i];
        while (i > 0) {
            const { date, record } = curRecord;
            const prevDate = getPrevWeeklyFetchDate(date);
            const prevRecord = recordInRange[i - 1];
            if (prevRecord.date === prevDate) {
                // 当周新增了成员时，前一周对应的 index 无值
                const incrementRecord = record - prevRecord.record;
                incrementRecordInRange.unshift({
                    date,
                    record: incrementRecord,
                });
                // 更新循环条件
                curRecord = prevRecord;
                i--;
            }
            else {
                // 此时的 prevRecord 是周间统计的插值数据，直接更新 i 即可
                i--;
            }
        }

        return incrementRecordInRange;
    }
}
