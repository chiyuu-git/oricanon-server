import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
// service
import { MemberListService } from 'src/member-list/member-list.service';
import { IncrementRecord, RecordService } from 'src/record/record.service';
import { ProjectName, BasicType, RecordType } from '@chiyu-bit/canon.root';
import {
    RecordWeeklyInfo,
    MemberBasicInfo,
    HistoricalIncrementRank,
    MemberIncrementInfo,
} from '@chiyu-bit/canon.root/weekly';
import type { ProjectMemberListMap } from 'src/member-list/member-list.type';
import {
    QueryIncrementRankOfTypeInRange,
    QueryInfoTypeWeekly,
    QueryWeeklyDetail,
} from './query-weekly-info.dto';

interface ProjectRelativeRecord {
    projectName: ProjectName;
    baseRecord: number[];
    lastRecord: number[];
    beforeLastRecord: number[];
}

type ModuleRelativeRecord = ProjectRelativeRecord[];

interface ProjectRecord {
    projectName: ProjectName;
    records: number[];
    weekIncrementArr: number[];
    weekIncrementRateArr: string[];
}

type IncrementRecordOfTypeInRange = {
    projectName: ProjectName;
    recordType: RecordType;
    incrementRecordInRange: IncrementRecord[];
}[]

@Injectable()
export class WeeklyService implements OnApplicationBootstrap {
    projectMemberListMap: ProjectMemberListMap;

    constructor(
        private readonly recordService: RecordService,
        private readonly memberListService: MemberListService,
    ) {}

    /**
     * 生命周期 初始化
     */
    async onApplicationBootstrap() {
        this.projectMemberListMap = await this.memberListService.formatListWithProject();
    }

    async getInfoTypeWeekly({ basicType, infoType, endDate }: QueryInfoTypeWeekly) {
        const result = await this.recordService.findRelativeRecordOfType(
            basicType,
            infoType,
            endDate,
        );

        if (!result) {
            return `infoType ${infoType} not found`;
        }

        const { weekRange, relativeRecordOfType } = result;

        const recordWeeklyInfo = this.processModuleRelativeRecord(
            basicType,
            relativeRecordOfType,
        );

        // 处理集计范围
        const from = new Date(weekRange.from);
        const to = new Date(weekRange.to);
        const range = `${from.getMonth() + 1}/${from.getDate() + 1}至${to.getMonth() + 1}/${to.getDate()}`;

        recordWeeklyInfo.range = range;

        return recordWeeklyInfo;
    }

    /**
     * 处理周报相关的数据，接受 ModuleRelativeRecord ，返回
     */
    private processModuleRelativeRecord<Type extends BasicType>(
        moduleType: Type,
        moduleRelativeRecord: ModuleRelativeRecord,
    ) {
        const moduleTotal = 0;
        const moduleWeekIncrement = 0;
        const moduleLastWeekIncrement = 0;
        const moduleInfo: RecordWeeklyInfo<Type> = {
            range: '',
            projectInfoList: [],
            memberInfoList: [],
        };

        // moduleRelativeRecord = [llRecords, llsRecords, llssRecords, llnRecords]
        for (const projectRelativeRecord of moduleRelativeRecord) {
            if (projectRelativeRecord) {
                const { projectName } = projectRelativeRecord;
                const { projectRecord, projectInfo } = this.processProjectRelativeRecord(projectRelativeRecord);
                const memberInfo = this.formatRecordWithMemberList<Type>(
                    projectRecord,
                    this.projectMemberListMap[projectName][`${moduleType}s`],
                );
                moduleInfo.projectInfoList.push(projectInfo);
                moduleInfo.memberInfoList.push(...memberInfo);
            }
            else {
                moduleInfo.projectInfoList.push(null);
            }
        }

        return moduleInfo;
    }

    /**
     * moduleInfo 已经有每个企划的信息了，直接返回给前端即可
     * memberInfo 是全部企划的也属于 moduleInfo 的一部分，整理后返回
     */
    private formatRecordWithMemberList<Type extends BasicType>(
        projectRecord: ProjectRecord,
        memberList: MemberBasicInfo<Type>[],
    ) {
        if (!projectRecord) {
            return null;
        }
        const {
            projectName,
            records,
            weekIncrementArr,
            weekIncrementRateArr,
        } = projectRecord;

        return memberList.map((member, i) => ({
            projectName,
            record: records[i],
            weekIncrement: weekIncrementArr[i],
            weekIncrementRate: weekIncrementRateArr[i],
            ...member,
        }));
    }

    /**
     * 处理周报相关的数据，接受 projectRelativeRecord ，返回
     * 1. 企划中每个成员的周增量
     * 2. 企划中每个成员的先周比
     * 3. 单个企划总的周增量
     * 4. 单个企划的先周比
     */
    private processProjectRelativeRecord(projectRelativeRecord: ProjectRelativeRecord) {
        const { projectName, baseRecord, lastRecord, beforeLastRecord } = projectRelativeRecord;

        const projectTotal = baseRecord.reduce((acc, val) => acc + val);
        // 1.
        const weekIncrementArr = baseRecord.map((base, i) => base - lastRecord[i]);

        const lastWeekIncrement = lastRecord.map((last, i) => last - beforeLastRecord[i]);
        // 2.
        const weekIncrementRateArr = weekIncrementArr.map((increment, i) => {
            if (increment > 0 && lastWeekIncrement[i] > 0) {
                return `${((increment / lastWeekIncrement[i]) * 100).toFixed(0)}%`;
            }
            return null;
        });
        // 3.
        const projectWeekIncrement = weekIncrementArr.reduce((acc, val) => {
            const positiveVal = val > 0
                ? val
                : 0;
            return acc + positiveVal;
        });

        const projectLastWeekIncrement = lastWeekIncrement.reduce((acc, val) => {
            const positiveVal = val > 0
                ? val
                : 0;
            return acc + positiveVal;
        });
        // 4.
        let projectWeekIncrementRate = '';
        if (projectWeekIncrement > 0 && projectLastWeekIncrement > 0) {
            projectWeekIncrementRate = `${((projectWeekIncrement / projectLastWeekIncrement) * 100).toFixed(0)}%`;
        }

        return {
            projectRecord: {
                projectName,
                records: baseRecord,
                weekIncrementArr,
                weekIncrementRateArr,
            },
            projectInfo: {
                projectName,
                projectTotal,
                projectWeekIncrement,
                projectWeekIncrementRate,
            },
        };
    }

    /**
     * 处理推特 follower 周详情 ，返回
     * 1. 每个成员本周的日增量数组，一组折线
     * 2. 上一周的日平均增量数组，一条折现作为对比
     * 3. 星/虹动画期间的日增线，平均线，这些线似乎可以加到 incrementRank，需要一个均线服务
     * 4. 需要一个分位线服务
     */
    async getTwitterFollowerWeeklyDetail({ projectName, endDate }: QueryWeeklyDetail) {
        const { from, to } = await this.recordService.findWeekRange(endDate);
        const result = await this.recordService.findRangeRecordByUnionKey({ from, to });
        return result;
    }

    /**
     * 查找历史周增数组，先整理出排序后的数组，计算百分位套用公式即可
     * 默认维度 basicType projectName infoType
     */
    async getIncrementRankOfTypeInRange({
        basicType,
        recordType,
        from,
        to,
    }: QueryIncrementRankOfTypeInRange) {
        // 每个企划的历史周增数据
        const incrementRecordOfTypeInRange = await this.recordService.findIncrementRecordOfTypeInRange(
            basicType,
            [...Object.values(ProjectName)],
            recordType,
            from,
            to,
        );
        const incrementRankOfTypeInRange = this.processIncrementRecord(basicType, incrementRecordOfTypeInRange);

        return incrementRankOfTypeInRange;
    }

    /**
     * 获取企划内 incrementRecord 排序后的数组
     * 与 range、type 维度无关，函数内部的变量名均无 range、type
     */
    private processIncrementRecord<Type extends BasicType>(
        basicType: Type,
        incrementRecordOfTypeInRange: IncrementRecordOfTypeInRange,
    ) {
        const historicalIncrementRank: HistoricalIncrementRank = {
            historical: [],
        } as HistoricalIncrementRank;
        // 企划内排序
        for (const projectIncrementRecord of incrementRecordOfTypeInRange) {
            const { projectName, incrementRecordInRange: IncrementRecordInRange } = projectIncrementRecord;

            const sortedProjectIncrementInfo = this.processProjectIncrementRecord<Type>(
                IncrementRecordInRange,
                this.projectMemberListMap[projectName][`${basicType}s`],
            );

            historicalIncrementRank[projectName] = sortedProjectIncrementInfo;
            historicalIncrementRank.historical.push(...sortedProjectIncrementInfo);
        }

        // 全部企划再排序
        historicalIncrementRank.historical = historicalIncrementRank.historical
            .sort((a, b) => a.increment - b.increment);

        return historicalIncrementRank;
    }

    /**
     * flatten 企划内所有的增量记录，并添加上成员信息，排序后返回
     */
    private processProjectIncrementRecord<Type extends BasicType>(
        IncrementRecordInRange: IncrementRecord[],
        memberList: MemberBasicInfo<Type>[],
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
}
