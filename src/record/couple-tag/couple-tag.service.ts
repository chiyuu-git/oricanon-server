import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterRecordType } from '@chiyu-bit/canon.root';
import { CreateCoupleTagDto } from './dto/create-couple-tag.dto';
import { QueryCoupleTagDto } from './dto/query-conpule-tag.dto';
import { UpdateCoupleTagDto } from './dto/update-couple-tag.dto';
import { CoupleTag } from './entities/couple-tag.entity';
import { FindRecord, FindWeekRecord, QueryRecordDTO } from '../record.type';

@Injectable()
export class CoupleTagService implements FindWeekRecord, FindRecord {
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

    async findRecord(params: QueryRecordDTO) {
        const coupleTag = await this.repository.find({
            where: params,
        });
        if (coupleTag.length === 0) {
            return false;
        }
        return coupleTag[0].records;
    }

    async findWeekRecord(params: QueryCoupleTagDto) {
        const coupleTagArr = await this.repository.find({
            where: params,
        });
        // coupleTag 类型有三种，需要去重之后返回，先整理成 map 形式
        // default + reverse - intersection
        let defaultRecord: number[] = [];
        let reverseRecord: number[] = [];
        let intersectionRecord: number[] = [];
        for (const coupleTag of coupleTagArr) {
            const { type, records } = coupleTag;

            switch (type) {
                case CharacterRecordType.illust:
                    defaultRecord = records;
                    break;
                case CharacterRecordType.illustReverse:
                    reverseRecord = records;
                    break;
                case CharacterRecordType.illustIntersection:
                    intersectionRecord = records;
                    break;
                default:
            }
        }

        const res = defaultRecord.map((record, i) => record + reverseRecord[i] - intersectionRecord[i]);
        if (res.length > 0) {
            return res;
        }
        // return null 相当于 return any，还是用 false 比较好
        return false;
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
