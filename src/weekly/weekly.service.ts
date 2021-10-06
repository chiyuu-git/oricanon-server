import { Injectable } from '@nestjs/common';
import { DataService, ProjectName } from 'src/canon.type';
import { CouplePixivTagService } from 'src/couple-pixiv-tag/couple-pixiv-tag.service';
import { CouplePixivTag } from 'src/couple-pixiv-tag/entities/couple-pixiv-tag.entity';
import { MemberListService } from 'src/member-list/member-list.service';
import { getRelativeDate } from 'src/utils';

interface RelativeDate {
    baseDate: string;
    lastDate: string;
    beforeLastDate: string;
}

type CoupleDataService = CouplePixivTagService;

@Injectable()
export class WeeklyService {
    constructor(
        // DataService 总共有三种 character seiyuu couple 均实现了 DataService 接口
        // private readonly characterTagService: characterTagService,
        // private readonly seiyuuFollowService: seiyuuFollowService,
        private readonly couplePixivTagService: CouplePixivTagService,
        private readonly memberListService: MemberListService,
    ) {}

    async generateWeekly(endDate?: string) {
        const relativeDate = await this.findRelativeDate(endDate);
        const projectArray = await this.memberListService.formatListWithProject();
        for (const project of projectArray) {
            const { projectName, characters, seiyuus, characterCouples } = project;

            if (characterCouples) {
                // TODO: 根据service类型自动推断返回的实体类型
                // const relativeData = await this.findRelativeData<CouplePixivTag>(
                //     this.couplePixivTagService,
                //     projectName,
                //     relativeDate,
                // );
                // console.log('relativeData:', relativeData);
            }
        }
        return 'weekly';
    }

    /**
     * 根据几个 date，分别去 service 获取数据
     *
     * @param service
     * @param relativeDate
     */
    async findRelativeData<entity>(
        service: DataService<entity>,
        projectName: ProjectName,
        relativeDate: RelativeDate,
    ) {
        const { baseDate, lastDate, beforeLastDate } = relativeDate;
        const baseData = await service.find({
            projectName,
            date: baseDate,
        });
        const lastData = await service.find({
            projectName,
            date: lastDate,
        });
        const beforeLastData = await service.find({
            projectName,
            date: beforeLastDate,
        });

        return {
            baseData,
            lastData,
            beforeLastData,
        };
    }

    async findRelativeDate(endDate: string) {
        let baseDate = endDate;

        if (!baseDate) {
            // 如果 baseDate 为空，默认获取最后一条作为 baseDate
            const baseRecord = await this.couplePixivTagService.findLastFetchDate();
            baseDate = baseRecord.date;
        }

        return getRelativeDate(baseDate);
    }
}
