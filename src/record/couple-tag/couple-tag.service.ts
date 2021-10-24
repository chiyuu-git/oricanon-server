import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCoupleTagDto } from './dto/create-couple-tag.dto';
import { QueryCoupleTagDto } from './dto/query-conpule-tag.dto';
import { UpdateCoupleTagDto } from './dto/update-couple-tag.dto';
import { CoupleTag } from './entities/couple-tag.entity';
import { CoupleTagType } from './couple-tag.type';
import { FindWeekRecord } from '../record.type';

@Injectable()
export class CoupleTagService implements FindWeekRecord {
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
                case CoupleTagType.illust:
                    defaultRecord = records;
                    break;
                case CoupleTagType.illustReverse:
                    reverseRecord = records;
                    break;
                case CoupleTagType.illustIntersection:
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
