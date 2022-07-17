import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, ProjectName } from '@common/root';
import { CoupleRecordType } from '@common/record';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { RecordDataService } from '../common/record-data-service';
import {
    FindMemberListRecordInRange,
    QueryMemberListRecordInCategory,
    FindMemberListRecord,
} from '../common/dto/query-record-data.dto';
import { LLSSCouple } from './couple-tag.entity';
import { CoupleRecordEntity } from '../common/record.entity';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';

interface QueryUnionList {
    default: CoupleRecordType;
    reverse: CoupleRecordType;
    intersection: CoupleRecordType;
}
@Injectable()
export class CoupleTagService extends RecordDataService {
    category = Category.couple

    @InjectRepository(LLSSCouple)
    LLSSCoupleRepository: Repository<LLSSCouple>

    getRepositoryByProject(projectName: ProjectName): Repository<CoupleRecordEntity> {
        switch (projectName) {
            case ProjectName.llss:
                return this.LLSSCoupleRepository;
            default:
                throw new HttpException(`CoupleRepository of ${projectName} not exist`, HttpStatus.NOT_FOUND);
        }
    }

    // async findOneProjectRecord(params: QueryOneProjectRecordInCategory): Promise<null |number[]> {
    //     return this.handleCustomRecordType(params, this.findOneProjectRecordInDB);
    // }

    /**
     * couple 聚合入口，根据 recordType 调用不同的聚合方法
     */
    async findMemberListRecord(params: QueryMemberListRecordInCategory): Promise<null | number[]> {
        const { recordType, projectName } = params;

        if (projectName !== ProjectName.llss) {
            return null;
        }

        switch (recordType) {
            case CoupleRecordType.coupleUnionIllust:
                return this.findUnionIllust(params);
            case CoupleRecordType.coupleUnionNovel:
                return this.findUnionNovel(params);
            case CoupleRecordType.illustWithNovel:
                return this.findIllustWithNovel(params);
            // 普通类型 record
            default:
                return this.findMemberListRecordInDB(params);
        }
    }

    async findIllustWithNovel(params: QueryMemberListRecordInCategory) {
        const [unionIllustRecord, unionNovelRecord] = await Promise.all(
            [
                this.findUnionIllust(params),
                this.findUnionNovel(params),
            ],
        );

        if (unionIllustRecord && unionNovelRecord) {
            return unionIllustRecord.map((record, i) => record + unionNovelRecord[i]);
        }
        return null;
    }

    async findUnionNovel(params: QueryMemberListRecordInCategory) {
        return this.findUnion(params, {
            default: CoupleRecordType.novel,
            reverse: CoupleRecordType.novelReverse,
            intersection: CoupleRecordType.novelIntersection,
        });
    }

    async findUnionIllust(params: QueryMemberListRecordInCategory) {
        return this.findUnion(params, {
            default: CoupleRecordType.illust,
            reverse: CoupleRecordType.illustReverse,
            intersection: CoupleRecordType.illustIntersection,
        });
    }

    async findUnion(params: QueryMemberListRecordInCategory, typeList: QueryUnionList) {
        const findOptionList: FindMemberListRecord[] = Object.values(typeList)
            .map((recordType) => ({
                category: Category.couple,
                ...params,
                recordType,
            }));

        // union 类型有三种，需要去重之后返回，先整理成 map 形式
        // default + reverse - intersection
        const [
            defaultRecord,
            reverseRecord,
            intersectionRecord,
        ] = await Promise.all(findOptionList.map((findOption) => this.findMemberListRecordInDB(findOption)));

        if (!defaultRecord) {
            return null;
        }

        return defaultRecord.map((record, i) => {
            const reverse = (reverseRecord && reverseRecord[i]) || 0;
            const intersection = (intersectionRecord && intersectionRecord[i]) || 0;
            return record + reverse - intersection;
        });
    }

    async findMemberListRecordInRange(params: FindMemberListRecordInRange) {
        if (params.projectName !== ProjectName.llss) {
            return null;
        }
        // 普通类型 record
        return this.findRangeProjectRecordInDB(params);
    }
}
