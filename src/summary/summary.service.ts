import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Category, ProjectName } from '@common/root';
import { RecordType, ProjectRecord } from '@common/record';
import { HistoricalIncrementRank, MemberIncrementInfo } from '@common/summary';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { RecordService } from 'src/record/record.service';

import { ProjectMemberListKey, ProjectMemberListMap } from 'src/member-info/common';
import { MemberInfo } from '@src/member-info/entities/member-info.entity';
import {
    QueryMemberRecordInRange,
    QueryProjectRecordInRange,
    QueryRecordInRange,
} from '@src/record/common/dto/query-record-data.dto';

type IncrementRecordOfTypeInRange = (null | {
    projectName: ProjectName;
    incrementRecordInRange: ProjectRecord[];
})[]

@Injectable()
export class SummaryService implements OnApplicationBootstrap {
    projectMemberListMap: ProjectMemberListMap;

    constructor(
        private readonly recordService: RecordService,
        private readonly memberInfoService: MemberInfoService,
    ) {}

    /**
     * 生命周期 初始化
     */
    async onApplicationBootstrap() {
        this.projectMemberListMap = await this.memberInfoService.formatListWithProject();
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

    async getProjectWeekIncrementInRange({
        category,
        recordType,
        from,
        to,
        projectName,
    }: QueryProjectRecordInRange) {
        const weekIncrementInRange = await this.recordService.findProjectWeekIncrementInRange({
            category,
            recordType,
            from,
            to,
            projectName,
        });

        return weekIncrementInRange?.incrementRecordInRange;
    }

    /**
     * 查找历史周增数组，先整理出排序后的数组，计算百分位套用公式即可
     * 默认维度 category recordType
     * 没有指定 project 或 member，默认以 project 维度返回所有数据
     */
    async getWeekIncrementRankOfTypeInRange({
        category,
        recordType,
        from,
        to,
    }: QueryRecordInRange) {
        // 每个企划的历史周增数据
        const incrementRecordOfTypeInRange = await this.recordService.findAllProjectWeekIncrementInRange(
            category,
            recordType,
            [...Object.values(ProjectName)],
            from,
            to,
        );
        const incrementRankOfTypeInRange = this.processIncrementRecord(category, incrementRecordOfTypeInRange);

        return incrementRankOfTypeInRange;
    }

    /**
     * 获取企划内 incrementRecord 排序后的数组
     * 与 range、type 维度无关，函数内部的变量名均无 range、type
     */
    private processIncrementRecord(
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
                const memberList = this.projectMemberListMap[projectName][`${category}s` as ProjectMemberListKey];

                const sortedProjectIncrementInfo = this.processProjectIncrementRecord(
                    incrementRecordInRange,
                    // TODO: seiyuu ll 时可能为空，需要排除
                    memberList!,
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
    private processProjectIncrementRecord(
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
     * 获取指定日期的相对增量
     */
    async getRelativeIncrementOfTypeInRange(query: QueryProjectRecordInRange) {
        const recordInRange = await this.recordService.findProjectRecordInRange(query);

        if (!recordInRange) {
            throw new HttpException(`Service of ${query.category} not exist`, HttpStatus.NOT_FOUND);
        }

        const compareTarget = recordInRange[0].records;

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
