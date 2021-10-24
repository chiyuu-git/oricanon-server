import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindWeekRecord } from '../record.type';
import { CreateCharacterTagDto } from './dto/create-character-tag.dto';
import { QueryCharacterTagDto } from './dto/query-character-tag.dto';
import { UpdateCharacterTagDto } from './dto/update-character-tag.dto';
import { CharacterTag } from './entities/character-tag.entity';

@Injectable()
export class CharacterTagService implements FindWeekRecord {
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

    async findWeekRecord(params: QueryCharacterTagDto) {
        const characterTag = await this.repository.find({
            where: params,
        });
        const res = characterTag[0].records;
        if (res.length > 0) {
            return res;
        }
        return false;
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
        // TODO: 添加废除标记
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
