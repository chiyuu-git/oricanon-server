import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterRecordType } from '@chiyu-bit/canon.root';
import { FindAggregationRecord, FindRecord, QueryAggregationRecordDTO, QueryRecordDTO } from '../record.type';
import { CreateCharacterTagDto } from './dto/create-character-tag.dto';
import { QueryCharacterTagDto } from './dto/query-character-tag.dto';
import { UpdateCharacterTagDto } from './dto/update-character-tag.dto';
import { CharacterTag } from './entities/character-tag.entity';

@Injectable()
export class CharacterTagService implements FindRecord, FindAggregationRecord {
    constructor(
        @InjectRepository(CharacterTag)
        private repository: Repository<CharacterTag>,
    ) {}

    async create(createCoupleTagDto: CreateCharacterTagDto) {
        await this.repository.insert(createCoupleTagDto);
        return 'This action adds a new characterTag';
    }

    findAll() {
        return this.repository.find();
    }

    async findOne({ date, projectName, type }: QueryCharacterTagDto) {
        const characterTag = await this.repository.findOne({
            where: {
                date,
                projectName,
                type,
            },
        });
        return characterTag;
    }

    async findRecord(params: QueryRecordDTO) {
        const characterTag = await this.repository.find({
            where: params,
        });
        if (characterTag.length === 0) {
            return false;
        }
        return characterTag[0].records;
    }

    /**
     * 聚合 illust 和 novel，目前 character 只有一个聚合
     * 之后新增聚合此方法可以作为入口分发
     */
    async findAggregationRecord(params: QueryAggregationRecordDTO): Promise<false | number[]> {
        // 过滤掉 aggregationType ，获取全部类型的数据，用于聚合
        const { projectName, date } = params;
        const characterRecordArr = await this.repository.find({
            where: { projectName, date },
        });

        if (characterRecordArr.length === 0) {
            return false;
        }

        let illustRecord: number[] = [];
        let novelRecord: number[] = [];
        for (const characterRecord of characterRecordArr) {
            const { type, records } = characterRecord;

            switch (type) {
                case CharacterRecordType.illust:
                    illustRecord = records;
                    break;
                case CharacterRecordType.novel:
                    novelRecord = records;
                    break;
                default:
            }
        }
        // 聚合 pixiv_illust 和 pixiv_novel
        return illustRecord.map((record, i) => record + novelRecord[i]);
    }

    async update(
        { date, projectName, type }: QueryCharacterTagDto,
        updateCharacterTagDto: UpdateCharacterTagDto,
    ) {
        const coupleTag = await this.repository.update(
            { date, projectName, type },
            updateCharacterTagDto,
        );
        return coupleTag;
    }

    remove({ date, projectName, type }: QueryCharacterTagDto) {
        return `This action removes a ${date}, ${projectName}, ${type} characterTag`;
    }

    async findLastFetchDate() {
        const coupleTag = await this.repository.findOne({
            order: {
                date: 'DESC',
            },
        });
        return coupleTag.date;
    }
}
