import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
// service
import { MemberListService } from 'src/member-list/member-list.service';
import { RecordService } from 'src/record/record.service';
import { ProjectName, BasicType } from '@chiyu-bit/canon.root';
import { ModuleInfo, GetMemberInfo } from '@chiyu-bit/canon.root/weekly';
import type { ProjectMemberListMap } from 'src/member-list/member-list.type';
import { QueryTypeWeeklyInfo } from './query-weekly-info.dto';

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
    weekIncreaseArr: number[];
    weekIncreaseRateArr: string[];
}

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

    async getTypeWeeklyInfo({ basicType, infoType, endDate }: QueryTypeWeeklyInfo) {
        const result = await this.recordService.findRelativeRecordOfType(
            basicType,
            infoType,
            endDate,
        );

        if (!result) {
            return `infoType ${infoType} not found`;
        }

        const { weekRange, relativeRecordOfType } = result;

        const recordWeekInfo = this.processModuleRelativeRecord(
            basicType,
            this.projectMemberListMap,
            relativeRecordOfType,
        );

        // 处理集计范围
        const from = new Date(weekRange.from);
        const to = new Date(weekRange.to);
        const range = `${from.getMonth() + 1}/${from.getDate() + 1}至${to.getMonth() + 1}/${to.getDate()}`;

        return {
            range,
            recordWeekInfo,
        };
    }

    /**
     * 处理周报相关的数据，接受 ModuleRelativeRecord ，返回
     */
    processModuleRelativeRecord<Type extends BasicType>(
        listType: Type,
        projectMemberListMap: ProjectMemberListMap,
        moduleRelativeRecord: ModuleRelativeRecord,
    ) {
        const moduleTotal = 0;
        const moduleWeekIncrease = 0;
        const moduleLastWeekIncrease = 0;
        const moduleInfo: ModuleInfo<Type> = {
            projectInfo: [],
            memberInfo: [],
        };

        // moduleRelativeRecord = [llRecords, llsRecords, llssRecords, llnRecords]
        for (const projectRelativeRecord of moduleRelativeRecord) {
            if (projectRelativeRecord) {
                const { projectName } = projectRelativeRecord;
                const { projectRecord, projectInfo } = this.processProjectRelativeRecord(projectRelativeRecord);
                const memberList = projectMemberListMap[projectName];
                const memberInfo = this.formatRecordWithMemberList<Type>(
                    projectRecord,
                    memberList[`${listType}s`],
                );
                moduleInfo.projectInfo.push(projectInfo);
                moduleInfo.memberInfo.push(...memberInfo);
            }
            else {
                moduleInfo.projectInfo.push(null);
            }
        }

        return moduleInfo;
    }

    /**
     * moduleInfo 已经有每个企划的信息了，直接返回给前端即可
     * memberInfo 是全部企划的也属于 moduleInfo 的一部分，整理后返回
     */
    formatRecordWithMemberList<Type extends BasicType>(
        projectRecord: ProjectRecord,
        memberList: GetMemberInfo<Type>[],
    ) {
        if (!projectRecord) {
            return null;
        }
        const {
            projectName,
            records,
            weekIncreaseArr,
            weekIncreaseRateArr,
        } = projectRecord;

        return memberList.map((member, i) => ({
            projectName,
            record: records[i],
            weekIncrease: weekIncreaseArr[i],
            weekIncreaseRate: weekIncreaseRateArr[i],
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
    processProjectRelativeRecord(projectRelativeRecord: ProjectRelativeRecord) {
        const { projectName, baseRecord, lastRecord, beforeLastRecord } = projectRelativeRecord;

        const projectTotal = baseRecord.reduce((acc, val) => acc + val);
        // 1.
        const weekIncreaseArr = baseRecord.map((base, i) => base - lastRecord[i]);

        const lastWeekIncrease = lastRecord.map((last, i) => last - beforeLastRecord[i]);
        // 2.
        const weekIncreaseRateArr = weekIncreaseArr.map((increase, i) => {
            if (increase > 0 && lastWeekIncrease[i] > 0) {
                return `${((increase / lastWeekIncrease[i]) * 100).toFixed(0)}%`;
            }
            return null;
        });
        // 3.
        const projectWeekIncrease = weekIncreaseArr.reduce((acc, val) => {
            const positiveVal = val > 0
                ? val
                : 0;
            return acc + positiveVal;
        });

        const projectLastWeekIncrease = lastWeekIncrease.reduce((acc, val) => {
            const positiveVal = val > 0
                ? val
                : 0;
            return acc + positiveVal;
        });
        // 4.
        let projectWeekIncreaseRate = '';
        if (projectWeekIncrease > 0 && projectLastWeekIncrease > 0) {
            projectWeekIncreaseRate = `${((projectWeekIncrease / projectLastWeekIncrease) * 100).toFixed(0)}%`;
        }

        return {
            projectRecord: {
                projectName,
                records: baseRecord,
                weekIncreaseArr,
                weekIncreaseRateArr,
            },
            projectInfo: {
                projectName,
                projectTotal,
                projectWeekIncrease,
                projectWeekIncreaseRate,
            },
        };
    }
}
