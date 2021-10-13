import { Injectable } from '@nestjs/common';
import { ProjectMemberListMap, ProjectName } from 'src/member-list/member-list.type';
import { getRelativeDate } from 'src/utils';
import { CharacterTagService } from './character-tag/character-tag.service';
import { CoupleTagService } from './couple-tag/couple-tag.service';
import { FindWeekRecord } from './record.type';
import { SeiyuuFollowerService } from './seiyuu-follower/seiyuu-follower.service';

export enum RecordType {
    character= 'character',
    couple= 'couple',
    seiyuu= 'seiyuu',
}

const module2Service = {
    [RecordType.character]: 'characterTagService',

    [RecordType.couple]: 'coupleTagService',

    [RecordType.seiyuu]: 'seiyuuFollowService',
};

type DataString = string;

type RelativeDate = DataString[];

@Injectable()
export class RecordService {
    constructor(
        // RecordService 总共有三种 character seiyuu couple 均实现了 RecordService 接口
        private readonly characterTagService: CharacterTagService,
        private readonly seiyuuFollowService: SeiyuuFollowerService,
        private readonly coupleTagService: CoupleTagService,
    ) {}

    async findAllModuleRelativeRecord(projectMemberListMap: ProjectMemberListMap, endDate?: string) {
        // QueryRecordDTO 仅需要 projectName 和 date 字段
        const relativeDate = await this.findRelativeDate(endDate);
        const weekRange = {
            from: relativeDate[1],
            to: relativeDate[0],
        };

        const allModuleRelativeRecord = await Promise.all(
            Object.values(RecordType).map((recordType) => this.findModuleRelativeRecord(
                recordType, projectMemberListMap, relativeDate,
            )),
        );

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
    async findModuleRelativeRecord(
        recordType: RecordType,
        projectMemberList: ProjectMemberListMap,
        relativeDate: RelativeDate,
    ) {
        return Promise.all(
            Object.values(projectMemberList).map(async (memberList) => {
                const list = memberList[`${recordType}s`];
                if (list?.length > 0) {
                    const { projectName } = memberList;
                    const [baseRecord, lastRecord, beforeLastRecord] = await this.findProjectRelativeRecord(
                        this[module2Service[recordType]],
                        projectName,
                        relativeDate,
                    );
                    return {
                        recordType,
                        projectName,
                        baseRecord,
                        lastRecord,
                        beforeLastRecord,
                    };
                }
                return null;
            }),
        );
    }

    /**
     * 根据 relativeDate，去 service 获取单个企划的数据
     */
    async findProjectRelativeRecord(
        service: FindWeekRecord,
        projectName: ProjectName,
        relativeDate: RelativeDate,
    ) {
        return Promise.all(
            relativeDate.map((date) => service.findWeekRecord({
                projectName,
                date,
            })),
        );
    }

    private async findRelativeDate(endDate: string): Promise<DataString[]> {
        let baseDate = endDate;

        if (!baseDate) {
            // 如果 baseDate 为空，默认获取最后一条作为 baseDate
            baseDate = await this.coupleTagService.findLastFetchDate();
        }

        return getRelativeDate(baseDate);
    }
}
