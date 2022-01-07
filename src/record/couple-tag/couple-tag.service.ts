import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BasicType, ProjectName } from '@common/root';
import { CoupleRecordType } from '@common/record';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { RecordDataService } from '../common/record-data-service';
import {
    QueryOneProjectRecord,
    QueryOneProjectRecordInDB,
    QueryRangeProjectRecordOfTypeDto,
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
    @InjectRepository(LLSSCouple)
    LLSSCoupleRepository: Repository<LLSSCouple>

    getRepositoryByProject(projectName: ProjectName): Repository<CoupleRecordEntity> {
        switch (projectName) {
            case ProjectName.llss:
                return this.LLSSCoupleRepository;
            default:
                return null;
        }
    }

    createCoupleRecordOfProject(createProjectCoupleRecordDto: CreateRecordOfProjectDto) {
        return this.createRecordOfProject(BasicType.couple, createProjectCoupleRecordDto);
    }

    /**
     * findOneCoupleProjectRecord
     * couple 聚合入口，根据 aggregationType 调用不同的聚合方法
     */
    async findOneProjectRecord(params: QueryOneProjectRecord): Promise<false |number[]> {
        const { recordType, projectName } = params;

        if (projectName !== ProjectName.llss) {
            return false;
        }

        switch (recordType) {
            case CoupleRecordType.coupleUnionIllust:
                return this.findUnionIllust(params);
            case CoupleRecordType.coupleUnionNovel:
                return this.findUnionNovel(params);
            case CoupleRecordType.illustWithNovel:
                return this.findIllustWithNovel(params);
            default:
        }

        return this.findOneProjectRecordInDB({
            basicType: BasicType.couple,
            ...params,
        });
    }

    async findIllustWithNovel(params: QueryOneProjectRecord) {
        const [unionIllustRecord, unionNovelRecord] = await Promise.all(
            [
                this.findUnionIllust(params),
                this.findUnionNovel(params),
            ],
        );

        if (unionIllustRecord && unionNovelRecord) {
            return unionIllustRecord.map((record, i) => record + unionNovelRecord[i]);
        }
        return [];
    }

    async findUnionNovel(params: QueryOneProjectRecord) {
        return this.findUnion(params, {
            default: CoupleRecordType.novel,
            reverse: CoupleRecordType.novelReverse,
            intersection: CoupleRecordType.novelIntersection,
        });
    }

    async findUnionIllust(params: QueryOneProjectRecord) {
        return this.findUnion(params, {
            default: CoupleRecordType.illust,
            reverse: CoupleRecordType.illustReverse,
            intersection: CoupleRecordType.illustIntersection,
        });
    }

    async findUnion(params: QueryOneProjectRecord, typeList: QueryUnionList) {
        const findOptionList: QueryOneProjectRecordInDB[] = Object.values(typeList)
            .map((recordType) => ({
                basicType: BasicType.couple,
                ...params,
                recordType,
            }));

        // union 类型有三种，需要去重之后返回，先整理成 map 形式
        // default + reverse - intersection
        const [
            defaultRecord,
            reverseRecord,
            intersectionRecord,
        ] = await Promise.all(findOptionList.map((findOption) => this.findOneProjectRecordInDB(findOption)));

        if (!defaultRecord) {
            // return null 相当于 return any，还是用 false 比较好
            return false;
        }

        return defaultRecord.map((record, i) => record + reverseRecord[i] - intersectionRecord[i]);
    }

    async findRangeBasicTypeProjectRecord(params: QueryRangeProjectRecordOfTypeDto) {
        // if (params.projectName !== ProjectName.llss) {
        //     return false;
        // }
        // 普通类型 record
        return this.findRangeProjectRecordEntityInDB(BasicType.couple, params);
    }
}
