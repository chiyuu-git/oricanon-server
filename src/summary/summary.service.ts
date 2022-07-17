import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Category, ProjectName } from '@common/root';
import { ProjectRecord, CharaRecordType, CoupleRecordType } from '@common/record';
import {
    CharaMemberIncrementInfo,
    HistoricalIncrementRank,
    MemberIncrementInfo,
    SummaryRecordType,
} from '@common/summary';
import { MemberInfoService } from '@src/member-info/member-info.service';
import { RecordService } from '@src/record/record.service';

import { ProjectMemberListKey, ProjectMemberListMap } from 'src/member-info/common';
import { MemberInfo } from '@src/member-info/entities/member-info.entity';
import {
    QueryMemberListRecordInRange,
    QueryMemberRecordInRange,
    QueryProjectRecordInRange,
    QueryRecordInRange,
} from '@src/record/common/dto/query-record-data.dto';
import { getPercentile } from '@utils/math';

type IncrementRecordOfTypeInRange = (null | {
    projectName: ProjectName;
    incrementRecordInRange: ProjectRecord[];
})[]

@Injectable()
export class SummaryService {
    projectMemberListMap: ProjectMemberListMap;

    constructor(
        private readonly recordService: RecordService,
        private readonly memberInfoService: MemberInfoService,
    ) {}

    getProjectMemberList(category: Category, projectName: ProjectName) {
        return this.memberInfoService.findProjectMemberListOfCategory(
            category,
            projectName,
            { onlyActive: false },
        );
    }

    async getMemberWeekIncrementInRange({
        category,
        recordType,
        from,
        to,
        romaName,
    }: QueryMemberRecordInRange) {
        const weekIncrementInRange = await this.recordService.findMemberWeekIncrementInRange({
            category,
            recordType,
            from,
            to,
            romaName,
        });

        return weekIncrementInRange;
    }

    async getMemberListWeekIncrementInRange({
        category,
        recordType,
        from,
        to,
        projectName,
    }: QueryProjectRecordInRange) {
        const memberList = await this.getProjectMemberList(category, projectName);
        const weekIncrementInRange = await this.recordService.findMemberListWeekIncrementInRange({
            category,
            recordType,
            projectName,
            memberList,
            from,
            to,
        });

        return weekIncrementInRange?.incrementRecordInRange;
    }

    /**
     * 默认返回全企划的百分位即可
     * 后续有企划内分位要求时再新增即可
     */
    async getHistoricalWeekIncrementOfPercentile(query: QueryRecordInRange & { percentile: number; }) {
        const rank = await this.getWeekIncrementRankInRange(query);

        const incrementArray = rank.historical.map(({ increment }) => increment);
        const { percentile } = query;

        return getPercentile(incrementArray, percentile);
    }

    /**
     * 查找历史周增数组，先整理出排序后的数组，计算百分位套用公式即可
     * 默认维度 category recordType
     * 没有指定 project 或 member，默认以 project 维度返回所有数据
     */
    async getWeekIncrementRankInRange({
        category,
        recordType,
        from,
        to,
    }: QueryRecordInRange) {
        // 每个企划的历史周增数据
        const incrementRecordInRange = await this.findAllProjectWeekIncrementInRange({
            category,
            recordType,
            from,
            to,
        });
        const incrementRankOfTypeInRange = await this.processWeekIncrementRank(category, incrementRecordInRange);

        return incrementRankOfTypeInRange;
    }

    /**
     * 查找历史周增数组
     * 没有指定 project 或 member，默认以 project 维度返回所有数据
     */
    async findAllProjectWeekIncrementInRange({
        category,
        recordType,
        from,
        to,
    }: QueryRecordInRange) {
        return Promise.all(
            Object.values(ProjectName).map(async (projectName) => {
                const memberList = await this.getProjectMemberList(category, projectName);
                return this.recordService.findMemberListWeekIncrementInRange({
                    category,
                    recordType,
                    projectName,
                    memberList,
                    from,
                    to,
                });
            }),
        );
    }

    /**
     * 获取企划内 incrementRecord 排序后的数组
     * 与 range、type 维度无关，函数内部的变量名均无 range、type
     */
    private async processWeekIncrementRank(
        category: Category,
        incrementRecordOfTypeInRange: IncrementRecordOfTypeInRange,
    ) {
        // const historicalIncrementRank: HistoricalIncrementRank = {
        //     historical: [],
        // } as HistoricalIncrementRank;
        const historicalIncrementRank = <HistoricalIncrementRank><unknown>{
            historical: [],
        };
        // 企划内排序
        for (const projectIncrementRecord of incrementRecordOfTypeInRange) {
            if (projectIncrementRecord) {
                const { projectName, incrementRecordInRange } = projectIncrementRecord;
                // eslint-disable-next-line no-await-in-loop
                const memberList = await this.getProjectMemberList(category, projectName);

                const sortedProjectIncrementInfo = this.processProjectWeekIncrementRank(
                    incrementRecordInRange,
                    // TODO: person ll 时可能为空，需要排除
                    memberList,
                );

                historicalIncrementRank[projectName] = sortedProjectIncrementInfo;
                historicalIncrementRank.historical.push(...sortedProjectIncrementInfo);
            }
        }

        // 全部企划再排序
        historicalIncrementRank.historical = historicalIncrementRank.historical
            .sort((a, b) => a.increment - b.increment);

        return historicalIncrementRank;
    }

    /**
     * flatten 企划内所有的增量记录，并添加上成员信息，排序后返回
     */
    private processProjectWeekIncrementRank(
        IncrementRecordInRange: ProjectRecord[],
        memberList: MemberInfo[],
    ) {
        const projectIncrementInfoArray: MemberIncrementInfo[] = [];
        // 1. flatten & add member info
        for (const { date, records } of IncrementRecordInRange) {
            const len = records.length;
            for (let index = 0; index < len; index++) {
                const increment = records[index];
                const { romaName } = memberList[index];
                projectIncrementInfoArray.push({
                    date,
                    increment,
                    romaName,
                });
            }
        }
        // 2. sort
        const sortedProjectIncrementInfo = projectIncrementInfoArray
            .sort((a, b) => a.increment - b.increment);

        return sortedProjectIncrementInfo;
    }

    /**
     * 获取企划所有成员的相对增量信息
     * 以企划成员整合所有 recordType 的信息
     */
    async getProjectRelativeIncrementInfo(
        category: Category,
        projectName: ProjectName,
        from: string,
        to?: string,
    ) {
        const memberList = await this.getProjectMemberList(category, projectName);
        const commonParam = {
            category,
            projectName,
            memberList,
            from: '2020-07-08',
            to: '2022-07-15',
        };

        // chara record type format
        // const projectIncrementList = await Promise.all([

        //     this.getProjectRelativeIncrement({
        //         // 从统计前一周开始比较好，可以规避姐姐的生日问题
        //         ...commonParam, recordType: CharaRecordType.illust, from: '2021-01-01',
        //     }),
        //     this.getProjectRelativeIncrement({ ...commonParam, recordType: CharaRecordType.novel }),
        //     this.getProjectRelativeIncrement({ ...commonParam, recordType: CharaRecordType.r18 }),
        //     this.getProjectRelativeIncrement({ ...commonParam, recordType: CharaRecordType.favorSum }),
        //     this.getProjectRelativeIncrement({
        //         ...commonParam, recordType: CharaRecordType.tagView, from: '2021-06-04',
        //     }),
        //     this.getProjectRelativeIncrement({ ...commonParam, recordType: CharaRecordType.fifty }),
        //     this.getProjectRelativeIncrement({ ...commonParam, recordType: CharaRecordType.hundred }),
        //     this.getProjectRelativeIncrement({ ...commonParam, recordType: CharaRecordType.fiveHundred }),
        //     this.getProjectRelativeIncrement({ ...commonParam, recordType: CharaRecordType.thousand }),
        //     this.getProjectRelativeIncrement({ ...commonParam, recordType: CharaRecordType.fiveThousand }),
        //     this.getProjectRelativeIncrement({ ...commonParam, recordType: CharaRecordType.tenThousand }),
        // ]);

        // couple record type format
        const projectIncrementList = await Promise.all([

            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.illust }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.illustReverse }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.illustIntersection }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.novel }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.novelReverse }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.novelIntersection }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.tagView }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.tagViewReverse }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.illustWithNovel }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.coupleUnionIllust }),
            this.getProjectRelativeIncrement({ ...commonParam, recordType: CoupleRecordType.coupleUnionNovel }),
        ]);

        const projectIncrementInfoList = memberList as unknown as CharaMemberIncrementInfo[];

        for (const { recordType, incrementList } of projectIncrementList) {
            for (const [i, val] of incrementList.entries()) {
                projectIncrementInfoList[i][recordType as CharaRecordType] = val;
            }
        }

        // 处理 r18Rate 和 favorRate 两个实用指标
        // for (const memberInfo of projectIncrementInfoList) {
        //     memberInfo[SummaryRecordType.r18Rate] = +(
        //         (memberInfo[CharaRecordType.r18] / memberInfo[CharaRecordType.illust]) * 100
        //     ).toFixed(2);

        //     memberInfo[SummaryRecordType.favorRate] = +(
        //         (memberInfo[CharaRecordType.favorSum] / memberInfo[CharaRecordType.illust]) * 100
        //     ).toFixed(2);
        // }

        return projectIncrementInfoList;
    }

    /**
     * 获取企划的相对增量
     * 相对增量排行榜与周增量排行榜的最主要的区别就是 时间范围
     * 相对增量排行榜时间范围是固定的，因此相关函数不需要带上 range
     * 分别获取 from 和 to 两个指定日期的数据，然后相减即可，排序后返回
     */
    async getProjectRelativeIncrement(query: QueryProjectRecordInRange) {
        const { category, projectName, recordType, from, to } = query;
        const memberList = await this.getProjectMemberList(category, projectName);
        const compareTargetParam = {
            ...query,
            memberList,
            date: from,
        };
        const targetParam = {
            ...query,
            memberList,
            date: to,
        };
        const [a, b] = await Promise.all([
            this.recordService.findMemberListRecord(compareTargetParam),
            this.recordService.findMemberListRecord(targetParam),
        ]);

        const compare = a || [];
        const target = b || [];

        return {
            recordType,
            incrementList: target.map((val, i) => (val || 0) - (compare[i] || 0)),
        };
    }

    /**
     * 获取范围内所有数据相对于指定日期的增量
     */
    async getRelativeIncrementInRange({
        category,
        recordType,
        projectName,
        from,
    }: QueryProjectRecordInRange) {
        const memberList = await this.getProjectMemberList(category, projectName);

        const recordInRange = await this.recordService.findMemberListRecordInRange({
            category,
            projectName,
            recordType,
            memberList,
            from,
        });

        if (!recordInRange) {
            throw new HttpException(`Service of ${category} not exist`, HttpStatus.NOT_FOUND);
        }

        const compareTarget = recordInRange[0].records;

        // 获取所有记录相对于 target 的增量
        const relativeIncrement = recordInRange.map(({ date, records }) => {
            const compareResult = records.map((val, i) => val - compareTarget[i]);
            return {
                date,
                records: compareResult,
            };
        });

        return relativeIncrement;
    }
}
