import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AggregationType, CharacterRecordType } from '@chiyu-bit/canon.root';
import { CreateCoupleTagDto } from './dto/create-couple-tag.dto';
import { QueryCoupleTagDto } from './dto/query-conpule-tag.dto';
import { UpdateCoupleTagDto } from './dto/update-couple-tag.dto';
import { CoupleTag } from './entities/couple-tag.entity';
import { FindAggregationRecord, FindRecord, QueryAggregationRecordDTO, QueryRecordDTO } from '../record.type';

interface QueryUnionList {
    typeList: {
        default: CharacterRecordType;
        reverse: CharacterRecordType;
        intersection: CharacterRecordType;
    };
}
@Injectable()
export class CoupleTagService implements FindRecord, FindAggregationRecord {
    constructor(
        @InjectRepository(CoupleTag)
        private repository: Repository<CoupleTag>,
    ) {}

    async create(createCoupleTagDto: CreateCoupleTagDto) {
        await this.repository.insert(createCoupleTagDto);
        return 'This action adds a new coupleTag';
    }

    findAll() {
        return this.repository.find();
    }

    async findOne({ date, projectName, type }: QueryCoupleTagDto) {
        const coupleTag = await this.repository.findOne({
            where: {
                date,
                projectName,
                type,
            },
        });
        return coupleTag;
    }

    async findRecord(params: QueryRecordDTO) {
        const coupleTag = await this.repository.find({
            where: params,
        });
        if (coupleTag.length === 0) {
            return false;
        }
        return coupleTag[0].records;
    }

    /**
     * couple 聚合入口，根据 aggregationType 调用不同的聚合方法
     */
    async findAggregationRecord(params: QueryAggregationRecordDTO): Promise<false | number[]> {
        const { projectName, infoType, date } = params;
        switch (infoType) {
            case AggregationType.coupleUnionIllust:
                return this.findUnionIllust({ projectName, date });
            case AggregationType.coupleUnionNovel:
                return this.findUnionNovel({ projectName, date });
            case AggregationType.illustWithNovel:
                return this.findIllustWithNovel({ projectName, date });
            default:
                return false;
        }
    }

    async findIllustWithNovel(params: QueryAggregationRecordDTO) {
        const [unionIllustRecord, unionNovelRecord] = await Promise.all(
            [
                this.findUnionIllust(params),
                this.findUnionNovel(params),
            ],
        );

        if (unionIllustRecord && unionNovelRecord) {
            return unionIllustRecord.map((record, i) => record + unionNovelRecord[i]);
        }
        return false;
    }

    async findUnionNovel(params: QueryAggregationRecordDTO) {
        const { projectName, date } = params;
        return this.findUnion({
            projectName,
            date,
            typeList: {
                default: CharacterRecordType.novel,
                reverse: CharacterRecordType.novelReverse,
                intersection: CharacterRecordType.novelIntersection,
            },
        });
    }

    async findUnionIllust(params: QueryAggregationRecordDTO) {
        const { projectName, date } = params;
        return this.findUnion({
            projectName,
            date,
            typeList: {
                default: CharacterRecordType.illust,
                reverse: CharacterRecordType.illustReverse,
                intersection: CharacterRecordType.illustIntersection,
            },
        });
    }

    async findUnion(params: Omit<QueryAggregationRecordDTO, 'infoType'> & QueryUnionList) {
        const { projectName, date, typeList } = params;
        const findOptionList = Object.values(typeList).map((type) => ({ projectName, date, type }));

        const coupleTagArr = await this.repository.find({
            where: findOptionList,
        });
        // union 类型有三种，需要去重之后返回，先整理成 map 形式
        // default + reverse - intersection
        let defaultRecord: number[] = [];
        let reverseRecord: number[] = [];
        let intersectionRecord: number[] = [];
        for (const coupleTag of coupleTagArr) {
            const { type, records } = coupleTag;

            switch (type) {
                case typeList.default:
                    defaultRecord = records;
                    break;
                case typeList.reverse:
                    reverseRecord = records;
                    break;
                case typeList.intersection:
                    intersectionRecord = records;
                    break;
                default:
            }
        }

        const unionRecord = defaultRecord.map((record, i) => record + reverseRecord[i] - intersectionRecord[i]);
        if (unionRecord.length > 0) {
            return unionRecord;
        }
        // return null 相当于 return any，还是用 false 比较好
        return false;
    }

    async update(
        { date, projectName, type }: QueryCoupleTagDto,
        updateCoupleTagDto: UpdateCoupleTagDto,
    ) {
        const coupleTag = await this.repository.update(
            { date, projectName, type },
            updateCoupleTagDto,
        );
        return coupleTag;
    }

    remove({ date, projectName, type }: QueryCoupleTagDto) {
        // TODO: 添加废除标记
        return `This action removes a ${date}, ${projectName}, ${type} coupleTag`;
    }
}
