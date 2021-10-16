/**
 * TODO:
 * 5. 两个script处理好，转换成server-next
 * 6. couple的处理好，转换成server-nest
 * 7. client处理好，转换成server-nest
 */

import { Injectable } from '@nestjs/common';
import { ProjectName } from 'src/canon.type';
// service
import { MemberListService } from 'src/member-list/member-list.service';
import { RecordService, RecordType } from 'src/record/record.service';

import type { Character, Couple, ProjectMemberListMap, Seiyuu } from 'src/member-list/member-list.type';
import { CoupleTagType } from 'src/record/couple-tag/couple-tag.type';

interface ProjectRelativeRecord {
    recordType: RecordType;
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

interface MemberWeekInfo {
    projectName: ProjectName;
    record: number;
    weekIncrease: number;
    weekIncreaseRate: string;
}

interface CharacterInfo extends Character, MemberWeekInfo {}

type CoupleTypeRecord = Partial<Record<CoupleTagType, number>>;
interface CoupleInfo extends Couple, MemberWeekInfo, CoupleTypeRecord { }

interface SeiyuuInfo extends Seiyuu, MemberWeekInfo { }

interface ProjectInfo {
    projectName: ProjectName;
    projectTotal: number;
    projectWeekIncrease: number;
    projectIncreaseRate: string;
}
interface MemberInfoMap {
    [RecordType.character]: Character,

    [RecordType.couple]: Couple,

    [RecordType.seiyuu]: Seiyuu,
}

interface ModuleInfo {
    projectInfo: ProjectInfo[];
    // TODO: 更准确的类型，难点在于处理函数返回值是联合类型
    memberInfo: MemberWeekInfo[];
}

@Injectable()
export class WeeklyService {
    constructor(

        private readonly recordService: RecordService,
        private readonly memberListService: MemberListService,
    ) {}

    async generateWeekly(endDate?: string) {
        const projectMemberListMap = await this.memberListService.formatListWithProject();
        const {
            weekRange,
            allModuleRelativeRecord,
        } = await this.recordService.findAllModuleRelativeRecord(projectMemberListMap, endDate);

        const [characterInfo, coupleInfo, seiyuuInfo] = allModuleRelativeRecord.map(
            (moduleRelativeRecord) => this.processModuleRelativeRecord(
                projectMemberListMap,
                moduleRelativeRecord,
            ),
        );

        // 处理集计范围，处理一下日期
        const from = new Date(weekRange.from);
        const to = new Date(weekRange.to);
        const range = `${from.getMonth() + 1}/${from.getDate() + 1}至${to.getMonth() + 1}/${to.getDate()}`;

        return {
            range,
            characterInfo,
            coupleInfo,
            seiyuuInfo,
        };
    }

    /**
     * 处理周报相关的数据，接受 ModuleRelativeRecord ，返回
     */
    processModuleRelativeRecord(
        projectMemberListMap: ProjectMemberListMap,
        moduleRelativeRecord: ModuleRelativeRecord,
    ) {
        const moduleTotal = 0;
        const moduleWeekIncrease = 0;
        const moduleLastWeekIncrease = 0;
        const moduleInfo: ModuleInfo = {
            projectInfo: [],
            memberInfo: [],
        };

        // moduleRelativeRecord = [llRecords, llsRecords, llssRecords, llnRecords]
        for (const projectRelativeRecord of moduleRelativeRecord) {
            if (projectRelativeRecord) {
                const { projectName, recordType } = projectRelativeRecord;
                const { projectRecord, projectInfo } = this.processProjectRelativeRecord(projectRelativeRecord);
                const memberList = projectMemberListMap[projectName];
                // 即使通过 recordType 明确了返回的类型，但是一定是联合类型
                const memberInfo = this.formatRecordWithMemberList(
                    recordType,
                    projectRecord,
                    memberList[`${recordType}s`],
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
    formatRecordWithMemberList<Type extends RecordType>(
        recordType: Type,
        projectRecord: ProjectRecord,
        memberList: MemberInfoMap[Type][],
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
        let projectIncreaseRate = '';
        if (projectWeekIncrease > 0 && projectLastWeekIncrease > 0) {
            projectIncreaseRate = `${((projectWeekIncrease / projectLastWeekIncrease) * 100).toFixed(0)}%`;
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
                projectIncreaseRate,
            },
        };
    }
}
