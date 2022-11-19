import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, ProjectName } from '@common/root';
import { CoupleRecordType } from '@common/record';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { IndexDate, MembersRecordEntity, RecordDataService } from '../common/record-data-service';
import { FindMembersRecordInRange } from '../common/dto/query-record-data.dto';
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

    /**
     * couple 聚合入口，根据 recordType 调用不同的聚合方法
     */
    async findMembersRecordInRange(params: FindMembersRecordInRange): Promise<null | MembersRecordEntity[]> {
        const { recordType } = params;

        switch (recordType) {
            case CoupleRecordType.illustUnion:
                return this.findUnionIllust(params);
            case CoupleRecordType.novelUnion:
                return this.findUnionNovel(params);
            case CoupleRecordType.illustWithNovel:
                return this.findIllustWithNovel(params);
            // 普通类型 record
            default:
                return this.findMembersRangeRecordInDB(params);
        }
    }

    async findIllustWithNovel(params: FindMembersRecordInRange) {
        const unionRecordType = params.recordType;
        const [illustRecords, novelRecords] = await Promise.all(
            [
                this.findUnionIllust(params),
                this.findUnionNovel(params),
            ],
        );

        if (!illustRecords || !novelRecords) {
            return null;
        }

        const sumRecord: MembersRecordEntity[] = [];
        const len = illustRecords.length;

        for (let indexDate: IndexDate = 0; indexDate < len; indexDate++) {
            const illustRecord = illustRecords[indexDate].records;
            const novelRecord = novelRecords[indexDate].records;

            const { date, projectName } = illustRecords[indexDate];

            sumRecord.push({
                date,
                projectName,
                recordType: unionRecordType,
                records: illustRecord.map((record, j) => record + novelRecord[j]),
            });
        }
        return sumRecord;
    }

    async findUnionNovel(params: FindMembersRecordInRange) {
        return this.findUnion(params, {
            default: CoupleRecordType.novel,
            reverse: CoupleRecordType.novelReverse,
            intersection: CoupleRecordType.novelIntersection,
        });
    }

    async findUnionIllust(params: FindMembersRecordInRange) {
        return this.findUnion(params, {
            default: CoupleRecordType.illust,
            reverse: CoupleRecordType.illustReverse,
            intersection: CoupleRecordType.illustIntersection,
        });
    }

    async findUnion(params: FindMembersRecordInRange, typeList: QueryUnionList) {
        const unionRecordType = params.recordType;
        const findOptionList: FindMembersRecordInRange[] = Object.values(typeList)
            .map((type: CoupleRecordType) => ({
                category: this.category,
                ...params,
                recordType: type,
            }));

        // union 类型有三种，需要去重之后返回，先整理成 map 形式
        // default + reverse - intersection
        const [
            defaultRecords,
            reverseRecords,
            intersectionRecords,
        ] = await Promise.all(findOptionList.map((findOption) => this.findMembersRangeRecordInDB(findOption)));

        if (!defaultRecords || !reverseRecords || !intersectionRecords) {
            return null;
        }

        const unionRecord: MembersRecordEntity[] = [];
        const len = defaultRecords.length;

        for (let indexDate: IndexDate = 0; indexDate < len; indexDate++) {
            const defaultRecord = defaultRecords[indexDate].records;
            const reverseRecord = reverseRecords[indexDate].records;
            const intersectionRecord = intersectionRecords[indexDate].records;

            const { date, projectName } = defaultRecords[indexDate];

            unionRecord.push({
                date,
                projectName,
                recordType: unionRecordType,
                records: defaultRecord.map(
                    (record, j) => record + (reverseRecord[j] || 0) - (intersectionRecord[j] || 0),
                ),
            });
        }
        return unionRecord;
    }
}
