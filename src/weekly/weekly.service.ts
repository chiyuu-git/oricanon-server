/**
 * TODO:
 * 1. 返回待projectName的数组，而不是projectName为key的4个对象
 * 2. 生成单个moduleWeekly再组合
 * 3. memberList 确认好type
 * 4. 消除characterCouple变量，只保留couple
 * 5. 两个script处理好，转换成server-next
 * 6. couple的处理好，转换成server-nest
 * 7. client处理好，转换成server-nest
 * 8. map 可以借助 entries 和 forof 轻松遍历
 */

import { Injectable } from '@nestjs/common';
import { RecordService, ProjectName } from 'src/canon.type';
// service
import { CoupleTagService } from 'src/couple-tag/couple-tag.service';
import { CharacterTagService } from 'src/character-tag/character-tag.service';
import { SeiyuuFollowerService } from 'src/seiyuu-follower/seiyuu-follower.service';
import { MemberListService } from 'src/member-list/member-list.service';

import { getRelativeDate } from 'src/utils';
import type { Character, Couple, ListFormatWithProject, Seiyuu } from 'src/member-list/member-list.type';

interface ProjectInfo {
    projectName: ProjectName;
    projectTotal: number;
    projectWeekIncrease: number;
    projectIncreaseRate: string;
}

interface ProjectRecord {
    projectName: ProjectName;
    records: number[];
    weekIncreaseArr: number[];
    weekIncreaseRateArr: string[];
}

interface CharacterInfo extends Character {
    record: number;
    weekIncrease: number;
    weekIncreaseRate: string;
}
interface CoupleInfo extends Couple {
    record: number;
    weekIncrease: number;
    weekIncreaseRate: string;
    defaultTag?: number;
    reverseTag?: number;
    intersection?: number;
}

interface SeiyuuInfo extends Seiyuu {
    record: number;
    weekIncrease: number;
    weekIncreaseRate: string;
}

interface baseModuleInfo {
    projectInfo: ProjectInfo;
    projectRecord: ProjectRecord;
}

type ModuleInfo = Partial<Record<ProjectName, baseModuleInfo>>

export interface CharacterModuleInfo {
    projectInfo: ProjectInfo[];
    memberInfo: CharacterInfo[];
}
export interface CoupleModuleInfo {
    projectInfo: ProjectInfo[];
    memberInfo: CoupleInfo[];
}
export interface SeiyuuModuleInfo {
    projectInfo: ProjectInfo[];
    memberInfo: SeiyuuInfo[];
}

enum RecordType {
    character= 'character',
    couple= 'couple',
    seiyuu= 'seiyuu',
}

const module2Service = {
    [RecordType.character]: 'characterTagService',

    [RecordType.couple]: 'coupleTagService',

    [RecordType.seiyuu]: 'seiyuuFollowService',
};

interface ProjectRelativeRecord {
    projectName: ProjectName;
    baseRecord: number[];
    lastRecord: number[];
    beforeLastRecord: number[];
}

type ModuleRelativeRecord = ProjectRelativeRecord[];
interface RelativeDate {
    baseDate: string;
    lastDate: string;
    beforeLastDate: string;
}

@Injectable()
export class WeeklyService {
    constructor(
        // RecordService 总共有三种 character seiyuu couple 均实现了 RecordService 接口
        private readonly characterTagService: CharacterTagService,
        private readonly seiyuuFollowService: SeiyuuFollowerService,
        private readonly coupleTagService: CoupleTagService,
        private readonly memberListService: MemberListService,
    ) {}

    async generateWeekly(endDate?: string) {
        const projectList = await this.memberListService.formatListWithProject();
        const {
            weekRange,
            allModuleRelativeRecord,
        } = await this.findAllModuleRelativeRecord(projectList, endDate);
        const [characterInfo, coupleInfo, seiyuuInfo] = allModuleRelativeRecord.map(
            (moduleRelativeRecord) => this.processModuleRelativeRecord(moduleRelativeRecord),
        );

        // 这三个最好是类的属性？
        const characterModuleInfo: CharacterModuleInfo = {
            projectInfo: [],
            memberInfo: [],
        };
        const coupleModuleInfo: CoupleModuleInfo = {
            projectInfo: [],
            memberInfo: [],
        };
        const seiyuuModuleInfo: SeiyuuModuleInfo = {
            projectInfo: [],
            memberInfo: [],
        };

        for (const project of projectList) {
            const { projectName, characters, couples, seiyuus } = project;
            if (characterInfo[projectName]) {
                const { projectInfo, projectRecord } = characterInfo[projectName];
                const memberInfo = this.formatRecordWithMemberList<Character>(projectRecord, characters);
                characterModuleInfo.projectInfo.push(projectInfo);
                characterModuleInfo.memberInfo.push(...memberInfo);
            }
            else {
                characterInfo[projectName] = null;
            }

            if (coupleInfo[projectName]) {
                const { projectInfo, projectRecord } = coupleInfo[projectName];
                coupleModuleInfo.projectInfo.push(projectInfo);
                const memberInfo = this.formatRecordWithMemberList<Couple>(
                    projectRecord,
                    couples,
                );
                coupleModuleInfo.memberInfo.push(...memberInfo);
            }

            if (seiyuuInfo[projectName]) {
                const { projectInfo, projectRecord } = seiyuuInfo[projectName];
                const memberInfo = this.formatRecordWithMemberList<Seiyuu>(projectRecord, seiyuus);
                seiyuuModuleInfo.projectInfo.push(projectInfo);
                seiyuuModuleInfo.memberInfo.push(...memberInfo);
            }
        }

        // 处理集计范围，处理一下日期
        const from = new Date(weekRange.from);
        const to = new Date(weekRange.to);
        const range = `${from.getMonth() + 1}/${from.getDate() + 1}至${to.getMonth() + 1}/${to.getDate()}`;

        return {
            range,
            characterModuleInfo,
            coupleModuleInfo,
            seiyuuModuleInfo,
        };
    }

    /**
     * moduleInfo 已经有每个企划的信息了，直接返回给前端即可
     * memberInfo 是全部企划的也属于 moduleInfo 的一部分，整理后返回
     */
    formatRecordWithMemberList<MemberType>(
        projectRecord: ProjectRecord,
        memberList: MemberType[],
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
     * 处理周报相关的数据，接受 ModuleRelativeRecord ，返回
     */
    processModuleRelativeRecord(moduleRelativeRecord: ModuleRelativeRecord) {
        const moduleTotal = 0;
        const moduleWeekIncrease = 0;
        const moduleLastWeekIncrease = 0;
        const moduleInfo: ModuleInfo = {};

        // moduleRelativeRecord = [llRecords, llsRecords, llssRecords, llnRecords]
        for (const projectRelativeRecord of moduleRelativeRecord) {
            if (projectRelativeRecord) {
                const { projectName } = projectRelativeRecord;
                moduleInfo[projectName] = this.processProjectRelativeRecord(projectRelativeRecord);
            }
        }

        return moduleInfo;
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

    async findAllModuleRelativeRecord(projectList: ListFormatWithProject[], endDate?: string) {
        // QueryRecordDTO 仅需要 projectName 和 date 字段
        const relativeDate = await this.findRelativeDate(endDate);
        const weekRange = {
            from: relativeDate.lastDate,
            to: relativeDate.baseDate,
        };

        // 获取每一个企划的 relativeDate characterTags
        const pendingCharacterTags = this.findModuleRelativeRecord(
            RecordType.character, projectList, relativeDate,
        );
        // 获取每一个企划的 relativeDate coupleTags
        const pendingCoupleTags = this.findModuleRelativeRecord(
            RecordType.couple, projectList, relativeDate,
        );
        // 获取每一个企划的 relativeDate seiyuuFollowers
        const pendingSeiyuuFollowers = this.findModuleRelativeRecord(
            RecordType.seiyuu, projectList, relativeDate,
        );

        const allModuleRelativeRecord = await Promise.all([
            pendingCharacterTags,
            pendingCoupleTags,
            pendingSeiyuuFollowers,
        ]);

        return {
            weekRange,
            allModuleRelativeRecord,
        };
    }

    /**
     * 获取该 module 全部企划的 relativeDate 数据
     * TODO:
     * 1. 智能提示为什么消失了
     */
    findModuleRelativeRecord(
        recordType: RecordType,
        projectList: ListFormatWithProject[],
        relativeDate: RelativeDate,
    ) {
        return Promise.all(
            projectList.map((project) => {
                const { projectName } = project;
                const list = project[`${recordType}s`];
                if (list?.length > 0) {
                    return this.findProjectRelativeRecord(
                        this[module2Service[recordType] as string],
                        projectName,
                        relativeDate,
                    );
                }
                return null;
            }),
        );
    }

    /**
     * 根据 relativeDate，去 service 获取单个企划的数据
     */
    async findProjectRelativeRecord(
        service: RecordService,
        projectName: ProjectName,
        relativeDate: RelativeDate,
    ) {
        const { baseDate, lastDate, beforeLastDate } = relativeDate;
        const baseRecord = await service.findWeekRecord({
            projectName,
            date: baseDate,
        });
        const lastRecord = await service.findWeekRecord({
            projectName,
            date: lastDate,
        });
        const beforeLastRecord = await service.findWeekRecord({
            projectName,
            date: beforeLastDate,
        });

        return {
            projectName,
            baseRecord,
            lastRecord,
            beforeLastRecord,
        };
    }

    async findRelativeDate(endDate: string) {
        let baseDate = endDate;

        if (!baseDate) {
            // 如果 baseDate 为空，默认获取最后一条作为 baseDate
            const baseRecord = await this.coupleTagService.findLastFetchDate();
            baseDate = baseRecord.date;
        }

        return getRelativeDate(baseDate);
    }
}
