import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Category, ProjectName } from '@common/root';
import {
    MemberListRecord,
    CharaRecordType,
    CoupleRecordType,
    GetRecordTypeByCategory,
} from '@common/record';
import {
    MemberRelativeIncrementInfo,
    CategoryIncrementRank,
    MemberWeekIncrement,
} from '@common/summary';
import { MemberInfoService } from '@src/member-info/member-info.service';
import { RecordService } from '@src/record/record.service';
import { MemberInfo } from '@src/member-info/entities/member-info.entity';
import { QueryMembersRecordInRange, QueryRecordInRange } from '@src/record/common/dto/query-record-data.dto';

import { getPercentile } from '@utils/math';

import { QueryMemberRecordInRangeDto, QueryProjectRecordInRangeDto } from './query-summary-info.dto';

@Injectable()
export class SummaryService {
    constructor(
        private readonly recordService: RecordService,
        private readonly memberInfoService: MemberInfoService,
    ) {}

    getProjectMembersOfCategory(
        category: Category,
        projectName: ProjectName,
        onlyActive = true,
    ) {
        return this.memberInfoService.findProjectMembersOfCategory(
            category,
            projectName,
            { onlyActive },
        );
    }

    /**
     * memberList 或 project 周增回顾
     */
    async getMembersWeekIncrementInRange({
        category,
        recordType,
        from,
        to,
        projectName,
    }: QueryProjectRecordInRangeDto) {
        const members = await this.getProjectMembersOfCategory(category, projectName);
        return this.recordService.findMembersWeekIncrementInRange({
            category,
            recordType,
            members,
            from,
            to,
        });
    }

    /**
     * member 周增回顾
     */
    async getMemberWeekIncrementInRange({
        category,
        recordType,
        from,
        to,
        romaName,
    }: QueryMemberRecordInRangeDto) {
        return this.recordService.findMemberWeekIncrementInRange({
            category,
            recordType,
            from,
            to,
            romaName,
        });
    }

    /**
     * category 周增回顾
     * 全 project 历史周增百分位
     */
    async getHistoricalWeekIncrementOfPercentile(query: QueryRecordInRange & { percentile: number; }) {
        const categoryIncrementRank = await this.getWeekIncrementRankInRangeOfCategory(query);

        const incrementList = categoryIncrementRank.historical.map(({ increment }) => increment);
        const { percentile } = query;

        return getPercentile(incrementList, percentile);
    }

    /**
     * category 周增回顾
     * 没有指定 project 或 member，默认以 project 维度返回所有数据
     */
    async getWeekIncrementRankInRangeOfCategory({
        category,
        recordType,
        from,
        to,
    }: QueryRecordInRange) {
        // 每个企划的历史周增数据
        const categoryIncrementRank = <CategoryIncrementRank><unknown>{
            historical: [],
        };

        await Promise.all(
            Object.values(ProjectName).map(async (projectName) => {
                const members = await this.getProjectMembersOfCategory(category, projectName);
                const incrementRecordInRange = await this.recordService.findMembersWeekIncrementInRange({
                    category,
                    recordType,
                    members,
                    from,
                    to,
                });

                let projectIncrementRank: MemberWeekIncrement[] = [];

                if (incrementRecordInRange) {
                    // 企划内排序
                    projectIncrementRank = this.processProjectIncrementRank(incrementRecordInRange, members);
                }

                categoryIncrementRank[projectName] = projectIncrementRank;
                categoryIncrementRank.historical.push(...projectIncrementRank);
            }),
        );

        // 全部企划再排序
        categoryIncrementRank.historical = categoryIncrementRank.historical
            .sort((a, b) => a.increment - b.increment);

        return categoryIncrementRank;
    }

    /**
     * 获取企划内部的增量排行榜
     * flatten 企划内所有的增量记录，并添加上成员信息，排序后返回
     */
    private processProjectIncrementRank(
        IncrementRecordInRange: MemberListRecord[],
        members: MemberInfo[],
    ) {
        const projectIncrementInfoArray: MemberWeekIncrement[] = [];
        // 1. flatten & add member info
        for (const { date, records } of IncrementRecordInRange) {
            const len = records.length;
            for (let index = 0; index < len; index++) {
                const increment = records[index];
                const { romaName } = members[index];
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
     * memberList / project all recordType 相对增量 回顾
     * 适用于 月榜，回顾整个月的增量
     *
     * 获取企划所有成员的相对增量信息
     * 以企划成员整合所有 recordType 的信息
     */
    async getProjectRelativeIncrementInfo<Type extends Category>(
        category: Type,
        projectName: ProjectName,
        from: string,
        to?: string,
    ) {
        const members = await this.getProjectMembersOfCategory(category, projectName);
        const commonParam = {
            category,
            projectName,
            members,
            from: '2022-08-05',
            to: '2022-08-12',
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

        // 处理 r18Rate 和 favorRate 两个实用指标
        // for (const memberInfo of projectIncrementInfoList) {
        //     memberInfo[SummaryRecordType.r18Rate] = +(
        //         (memberInfo[CharaRecordType.r18] / memberInfo[CharaRecordType.illust]) * 100
        //     ).toFixed(2);

        //     memberInfo[SummaryRecordType.favorRate] = +(
        //         (memberInfo[CharaRecordType.favorSum] / memberInfo[CharaRecordType.illust]) * 100
        //     ).toFixed(2);
        // }

        // couple record type format
        const allRecordTypeIncrementList = await Promise.all(
            Object.values(CoupleRecordType)
                .map((coupleRecordType) => this.processProjectRelativeIncrementOfType({
                    ...commonParam,
                    recordType: coupleRecordType,
                    members,
                })),
        );

        const projectIncrementInfoList = members as MemberRelativeIncrementInfo<Type>[];

        for (const { recordType, records, increments } of allRecordTypeIncrementList) {
            for (const [i, increment] of increments.entries()) {
                const record = records?.[i] || 0;

                // TODO: 无法赋值，却可以 assign
                Object.assign(projectIncrementInfoList[i], {
                    [recordType]: {
                        recordType,
                        record,
                        increment,
                        template: `${record} (${increment})`,
                    },
                });
            }
        }

        return projectIncrementInfoList;
    }

    /**
     * project recordType 相对增量 回顾
     * 获取企划内所有成员的指定日期的相对增量
     *
     * 相对增量排行榜与周增量排行榜的最主要的区别就是 时间范围
     * 相对增量排行榜时间范围是固定的，因此相关函数名不使用 range
     * 分别获取 from 和 to 两个指定日期的数据，然后相减获取增量
     * to 的数据，即为总量 ，默认也返回累计量
     */
    private async processProjectRelativeIncrementOfType(query: QueryMembersRecordInRange) {
        const { category, recordType, members, from, to } = query;

        const startParam = {
            ...query,
            members,
            date: from,
        };
        const endParam = {
            ...query,
            members,
            date: to,
        };
        const [startRecords, endRecords] = await Promise.all([
            this.recordService.findMembersRecord(startParam),
            this.recordService.findMembersRecord(endParam),
        ]);

        const compare = startRecords || [];
        const target = endRecords || [];

        return {
            recordType,
            records: endRecords,
            increments: target.map((val, i) => (val || 0) - (compare[i] || 0)),
        };
    }

    /**
     * 适用于 braRace 回顾
     * 获取范围内所有数据相对于指定日期的增量
     */
    async getRelativeIncrementSince({
        category,
        recordType,
        projectName,
        from,
        to,
    }: QueryProjectRecordInRangeDto) {
        const members = await this.getProjectMembersOfCategory(category, projectName);

        const recordInRange = await this.recordService.findMembersRecordInRange({
            category,
            recordType,
            members,
            from,
            to,
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
