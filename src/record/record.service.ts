import { Injectable } from '@nestjs/common';
import { ProjectName, BasicType, InfoType, isRecordType } from '@chiyu-bit/canon.root';
import { getRelativeDate } from 'src/utils';
import { CharacterTagService } from './character-tag/character-tag.service';
import { CoupleTagService } from './couple-tag/couple-tag.service';
import { FindAggregationRecord, FindRecord } from './record.type';
import { SeiyuuFollowerService } from './seiyuu-follower/seiyuu-follower.service';

const serviceMap = {
    [BasicType.character]: 'characterTagService',

    [BasicType.couple]: 'coupleTagService',

    [BasicType.seiyuu]: 'seiyuuFollowService',
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

    /**
     * 获取 recordType 对应的 module 下，所有企划的相关数据
     */
    async findRelativeRecordOfType(
        basicType: BasicType,
        infoType: InfoType,
        endDate?: string,
    ) {
        const service = serviceMap[basicType];

        if (!service) {
            return false;
        }

        const relativeDate = await this.findRelativeDate(endDate);
        const weekRange = {
            from: relativeDate[1],
            to: relativeDate[0],
        };

        const relativeRecordOfType = await Promise.all(
            Object.values(ProjectName).map(async (projectName) => {
                const [baseRecord, lastRecord, beforeLastRecord] = await this.findProjectRelativeRecord(
                    infoType,
                    this[service],
                    projectName,
                    relativeDate,
                );
                    // ts 4.4 支持
                    // const legalRecord = baseRecord && lastRecord && beforeLastRecord;
                    // record 为 false， 则 project 为空
                if (baseRecord && lastRecord && beforeLastRecord) {
                    return {
                        projectName,
                        recordType: infoType,
                        baseRecord,
                        lastRecord,
                        beforeLastRecord,
                    };
                }
                return null;
            }),
        );

        return {
            weekRange,
            relativeRecordOfType,
        };
    }

    /**
     * 去 service 获取单个企划的数据
     */
    async findProjectRelativeRecord(
        infoType: InfoType,
        service: FindRecord & FindAggregationRecord,
        projectName: ProjectName,
        relativeDate: RelativeDate,
    ) {
        if (isRecordType(infoType)) {
            return Promise.all(
                relativeDate.map((date) => service.findRecord({
                    projectName,
                    type: infoType,
                    date,
                })),
            );
        }

        return Promise.all(
            relativeDate.map((date, index) => index === 0 && service.findAggregationRecord({
                projectName,
                type: infoType,
                date,
            })),
        );
    }

    private async findRelativeDate(endDate: string): Promise<DataString[]> {
        let baseDate = endDate;

        if (!baseDate) {
            // 如果 baseDate 为空，默认获取最后一条作为 baseDate
            baseDate = await this.characterTagService.findLastFetchDate();
        }

        return getRelativeDate(baseDate);
    }
}
