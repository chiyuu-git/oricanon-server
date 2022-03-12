import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
// service
import { MemberInfoService } from 'src/member-info/member-info.service';
import { RecordService } from 'src/record/record.service';
import { ProjectName, BasicType } from '@common/root';
import { SeiyuuRecordType } from '@common/record';
import { RecordWeeklyInfo } from '@common/weekly';
import { ProjectMemberListKey, ProjectMemberListMap } from 'src/member-info/common';
import { MemberInfo } from '@src/member-info/entities/member-info.entity';
import {
    QueryRecordTypeWeekly,
    QueryWeeklyDetail,
} from './query-weekly-info.dto';

interface ProjectRelativeRecord {
    projectName: ProjectName;
    baseRecord: number[];
    lastRecord: number[];
    beforeLastRecord: number[];
}

type RelativeRecordOfType = (ProjectRelativeRecord | null)[];

interface ProjectRecord {
    records: number[];
    weekIncrementArr: number[];
    weekIncrementRateArr: string[];
}

@Injectable()
export class WeeklyService implements OnApplicationBootstrap {
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

    async getRecordTypeWeekly({ basicType, recordType, endDate }: QueryRecordTypeWeekly) {
        const result = await this.recordService.findRelativeRecordOfType(
            basicType,
            recordType,
            endDate,
        );

        if (!result) {
            return `record ${recordType} not found`;
        }

        const { weekRange, relativeRecordOfType } = result;

        const recordWeeklyInfo = this.processRelativeRecordOfType(
            basicType,
            relativeRecordOfType,
        );

        // 处理集计范围
        const from = new Date(weekRange.from);
        const to = new Date(weekRange.to);
        const range = `${from.getMonth() + 1}/${from.getDate() + 1} 至 ${to.getMonth() + 1}/${to.getDate()}`;

        recordWeeklyInfo.range = range;

        return recordWeeklyInfo;
    }

    /**
     * 处理周报相关的数据，接受 ModuleRelativeRecord ，返回
     */
    private processRelativeRecordOfType<Type extends BasicType>(
        basicType: Type,
        relativeRecordOfType: RelativeRecordOfType,
    ) {
        // const moduleTotal = 0;
        // const moduleWeekIncrement = 0;
        // const moduleLastWeekIncrement = 0;
        const moduleInfo: RecordWeeklyInfo = {
            range: '',
            projectInfoList: [],
            memberInfoList: [],
        };

        // moduleRelativeRecord = [llRecords, llsRecords, llssRecords, llnRecords]
        for (const projectRelativeRecord of relativeRecordOfType) {
            if (projectRelativeRecord) {
                const { projectName } = projectRelativeRecord;
                const { projectRecord, projectInfo } = this.processProjectRelativeRecord(projectRelativeRecord);
                const memberList = this.projectMemberListMap[projectName][`${basicType}s` as ProjectMemberListKey];
                const memberInfo = this.formatRecordWithMemberList(
                    projectRecord,
                    // projectRelativeRecord 已经判断过了，此时 memberList 一定是有值的
                    memberList!,
                );
                moduleInfo.projectInfoList.push(projectInfo);
                moduleInfo.memberInfoList.push(...memberInfo);
            }
            // else {
            //     moduleInfo.projectInfoList.push(null);
            // }
        }

        return moduleInfo;
    }

    /**
     * moduleInfo 已经有每个企划的信息了，直接返回给前端即可
     * memberInfo 是全部企划的也属于 moduleInfo 的一部分，整理后返回
     */
    private formatRecordWithMemberList(
        projectRecord: ProjectRecord,
        memberList: MemberInfo[],
    ) {
        const {
            records,
            weekIncrementArr,
            weekIncrementRateArr,
        } = projectRecord;

        return memberList.map((member, i) => ({
            romaName: member.romaName,
            record: records[i],
            weekIncrement: weekIncrementArr[i],
            weekIncrementRate: weekIncrementRateArr[i],
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
            return '';
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
    async getTwitterFollowerWeeklyDetail({ endDate }: QueryWeeklyDetail) {
        const { from, to } = await this.recordService.findWeekRange(endDate);
        const result = await this.recordService.findRangeRecordByUnionKey({
            basicType: BasicType.seiyuu,
            recordType: SeiyuuRecordType.twitterFollower,
            projectName: ProjectName.llss,
            from,
            to,
        });
        return result;
    }
}
