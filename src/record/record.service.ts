import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Category, DateString } from '@common/root';
import { MemberListRecord } from '@common/record';
import { getPrevWeeklyFetchDate, getRelativeDate } from '@common/weekly';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { getPercentile } from '@utils/math';
import { CharaTagService } from './chara-tag/chara-tag.service';
import { CoupleTagService } from './couple-tag/couple-tag.service';
import { PersonFollowerService } from './person/person.service';
import {
    QueryMembersRecordOfDate,
    QueryMembersRecordInRange,
    QueryMemberRecordInRange,
} from './common/dto/query-record-data.dto';

@Injectable()
export class RecordService {
    constructor(
        private readonly memberInfoService: MemberInfoService,
        // RecordDataService 总共有三种 chara person couple 均实现了 RecordDataService 接口
        private readonly charaTagService: CharaTagService,
        private readonly coupleTagService: CoupleTagService,
        private readonly personFollowerService: PersonFollowerService,
    ) {}

    private getDataServiceByCategory(category: Category) {
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
     * 调用 dataService 的方法时可以省略 to，由此方法统一返回 endDate
     * 默认的 endDate 为最新的 fetchDate
     */
    private async getDefaultEndDate(to?: string) {
        let endDate = to;
        if (!endDate) {
            endDate = await this.charaTagService.findLatestWeeklyFetchDate();
        }
        return endDate;
    }

    /**
     * 根据 endDate 获取 上周及上上周的日期，用于生成先周比
     */
    async findRelativeDate(endDate?: string): Promise<DateString[]> {
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

    /**
     * 去 service 获取单个企划的数据，暴露给具体业务的查询接口
     * 查询 date 时，from 与 to 相同；若无则统一取 endDate
     */
    async findMembersRecord({
        category,
        recordType,
        members,
        date,
    }: QueryMembersRecordOfDate) {
        const targetDate = await this.getDefaultEndDate(date);

        const membersRecordList = await this.getDataServiceByCategory(category).findMembersRecordInRange({
            recordType,
            members,
            from: targetDate,
            to: targetDate,
        });

        if (!membersRecordList) {
            return null;
        }

        return membersRecordList[0].records;
    }

    /**
     * 暴露给具体业务的查询接口
     */
    async findMembersRecordInRange({
        category,
        recordType,
        members,
        from,
        to,
    }: QueryMembersRecordInRange) {
        const endDate = await this.getDefaultEndDate(to);

        return this.getDataServiceByCategory(category).findMembersRecordInRange({
            recordType,
            members,
            from,
            to: endDate,
        });
    }

    /**
     * 查询周增数组的核心方法
     */
    async findMembersWeekIncrementInRange({
        category,
        recordType,
        members,
        from,
        to,
    }: QueryMembersRecordInRange) {
        let endDate = to;
        if (!endDate) {
            endDate = await this.getDefaultEndDate(to);
        }

        const rangeRecord = await this.getDataServiceByCategory(category).findMembersRecordInRange({
            recordType,
            members,
            from,
            to: endDate,
        });

        if (!rangeRecord) {
            return null;
        }

        // 倒过来获取周增数组
        const incrementRecordInRange: MemberListRecord[] = [];
        let i = rangeRecord.length - 1;
        let curRecord = rangeRecord[i];
        while (i > 0) {
            const { date, records } = curRecord;
            const prevWeeklyFetchDate = getPrevWeeklyFetchDate(date);
            const prevRecord = rangeRecord[i - 1];
            if (prevRecord.date === prevWeeklyFetchDate) {
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

        return incrementRecordInRange;
    }

    /**
     * 衍生接口，查询单个成员
     * 返回的 records 仅有一个元素，即为该成员的周增量
     * TODO: 看是否有需要把 records 数组改成 record 字段
     */
    async findMemberWeekIncrementInRange({
        category,
        recordType,
        from,
        to,
        romaName,
    }: QueryMemberRecordInRange) {
        const endDate = await this.getDefaultEndDate(to);

        const memberInfo = await this.memberInfoService.findMemberInfoByRomaName(category, romaName);

        return this.findMembersWeekIncrementInRange({
            category,
            recordType,
            members: [memberInfo],
            from,
            to: endDate,
        });
    }
}
