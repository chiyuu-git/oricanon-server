import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AggregationType, CharacterRecordType } from '@chiyu-bit/canon.root';
import { RecordDataService, RecordDataUnionKey } from '../common/record-data-service';
import { QueryOneAggtRecordDto } from '../common/dto/query-record-data.dto';
import { CreateCoupleTagDto } from './dto/create-couple-tag.dto';
import { QueryCoupleTagDto } from './dto/query-conpule-tag.dto';
import { UpdateCoupleTagDto } from './dto/update-couple-tag.dto';
import { CoupleTag } from './entities/couple-tag.entity';

interface QueryUnionList {
    typeList: {
        default: CharacterRecordType;
        reverse: CharacterRecordType;
        intersection: CharacterRecordType;
    };
}
@Injectable()
export class CoupleTagService extends RecordDataService {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(@InjectRepository(CoupleTag) repository: Repository<CoupleTag>) {
        super(repository);
    }

    async create(createCoupleTagDto: CreateCoupleTagDto) {
        await this.repository.insert(createCoupleTagDto);
        return 'This action adds a new coupleTag';
    }

    async findOne({ date, projectName, recordType }: QueryCoupleTagDto) {
        const coupleTag = await this.repository.findOne({
            where: {
                date,
                projectName,
                recordType,
            },
        });
        return coupleTag;
    }

    /**
     * couple 聚合入口，根据 aggregationType 调用不同的聚合方法
     */
    async findOneAggtRecord(params: QueryOneAggtRecordDto): Promise<false | number[]> {
        const { projectName, aggregationType, date } = params;
        switch (aggregationType) {
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

    async findIllustWithNovel(params: QueryOneAggtRecordDto) {
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

    async findUnionNovel(params: QueryOneAggtRecordDto) {
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

    async findUnionIllust(params: QueryOneAggtRecordDto) {
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

    async findUnion(params: Omit<QueryOneAggtRecordDto, 'infoType'> & QueryUnionList) {
        const { projectName, date, typeList } = params;
        const findOptionList: RecordDataUnionKey[] = Object.values(typeList)
            .map((recordType) => ({ projectName, date, recordType }));

        const coupleTagArr = await this.repository.find({
            where: findOptionList,
        });
        // union 类型有三种，需要去重之后返回，先整理成 map 形式
        // default + reverse - intersection
        let defaultRecord: number[] = [];
        let reverseRecord: number[] = [];
        let intersectionRecord: number[] = [];
        for (const coupleTag of coupleTagArr) {
            const { recordType, records } = coupleTag;

            switch (recordType) {
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
        { date, projectName, recordType }: QueryCoupleTagDto,
        updateCoupleTagDto: UpdateCoupleTagDto,
    ) {
        const coupleTag = await this.repository.update(
            { date, projectName, recordType },
            updateCoupleTagDto,
        );
        return coupleTag;
    }

    remove({ date, projectName, recordType }: QueryCoupleTagDto) {
        return `This action removes a ${date}, ${projectName}, ${recordType} coupleTag`;
    }
}
