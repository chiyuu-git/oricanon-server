import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataService } from 'src/canon.type';
import { Repository } from 'typeorm';
import { CreateCharacterPixivTagDto } from './dto/create-character-pixiv-tag.dto';
import { QueryCharacterPixivTagDto } from './dto/query-character-pixiv-tag.dto';
import { UpdateCharacterPixivTagDto } from './dto/update-character-pixiv-tag.dto';
import { CharacterPixivTag } from './entities/character-pixiv-tag.entity';

@Injectable()
export class CharacterPixivTagService implements DataService<CharacterPixivTag> {
    constructor(
        @InjectRepository(CharacterPixivTag)
        private repository: Repository<CharacterPixivTag>,
    ) {}

    async create(createCouplePixivTagDto: CreateCharacterPixivTagDto) {
        await this.repository.insert(createCouplePixivTagDto);
        return 'This action adds a new characterPixivTag';
    }

    findAll() {
        return this.repository.find();
    }

    async find(params: QueryCharacterPixivTagDto) {
        const characterTag = await this.repository.find({
            where: params,
        });
        return characterTag;
    }

    async findOne({ date, projectName, type }: QueryCharacterPixivTagDto) {
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
        { date, projectName, type }: QueryCharacterPixivTagDto,
        updateCharacterPixivTagDto: UpdateCharacterPixivTagDto,
    ) {
        const coupleTag = await this.repository.update(
            { date, projectName, type },
            updateCharacterPixivTagDto,
        );
        return coupleTag;
    }

    remove({ date, projectName, type }: QueryCharacterPixivTagDto) {
        // TODO: 添加废除标记
        return `This action removes a ${date}, ${projectName}, ${type} characterPixivTag`;
    }
}
