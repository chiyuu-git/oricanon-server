import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BasicType, ProjectName } from '@common/root';
import { RecordType, ProjectRecord } from '@common/record';
import { MemberInfoTypeMap } from '@common/member-info';
import { HistoricalIncrementRank, MemberIncrementInfo } from '@common/summary';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { RecordService } from 'src/record/record.service';

import { ProjectMemberListKey, ProjectMemberListMap } from 'src/member-info/common';
import { MemberInfo } from '@src/member-info/entities/member-info.entity';
import { QueryIncrementRankOfTypeInRange, QueryRelativeIncrementOfTypeInRange } from './query-summary-info.dto';

type IncrementRecordOfTypeInRange = (null | {
    projectName: ProjectName;
    recordType: RecordType;
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

    /**
     * 查找历史周增数组，先整理出排序后的数组，计算百分位套用公式即可
     * 默认维度 basicType projectName infoType
     */
    async getWeekIncrementRankOfTypeInRange({
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
                const memberList = this.projectMemberListMap[projectName][`${basicType}s` as ProjectMemberListKey];

                const sortedProjectIncrementInfo = this.processProjectIncrementRecord<Type>(
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
    private processProjectIncrementRecord<Type extends BasicType>(
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
    async getRelativeIncrementOfTypeInRange(query: QueryRelativeIncrementOfTypeInRange) {
        const recordInRange = await this.recordService.findRangeRecordByUnionKey(query);

        if (!recordInRange) {
            throw new HttpException(`Service of ${query.basicType} not exist`, HttpStatus.NOT_FOUND);
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
