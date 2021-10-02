import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCouplePixivTagDto } from './dto/create-couple-pixiv-tag.dto';
import { QueryCouplePixivTagDto } from './dto/query-conpule-pixiv-tag.dto';
import { UpdateCouplePixivTagDto } from './dto/update-couple-pixiv-tag.dto';
import { CouplePixivTag } from './entities/couple-pixiv-tag.entity';

@Injectable()
export class CouplePixivTagService {
    constructor(
        @InjectRepository(CouplePixivTag)
        private CouplePixivTagsRepository: Repository<CouplePixivTag>,
    ) {}

    async create(createCouplePixivTagDto: CreateCouplePixivTagDto) {
        await this.CouplePixivTagsRepository.insert(createCouplePixivTagDto);
        return 'This action adds a new couplePixivTag';
    }

    findAll() {
        return this.CouplePixivTagsRepository.find();
    }

    async findOne({ date, projectName, type }: QueryCouplePixivTagDto) {
        const coupleTag = await this.CouplePixivTagsRepository.findOne({
            where: {
                date,
                projectName,
                type,
            },
        });
        return coupleTag;
    }

    async update(
        { date, projectName, type }: QueryCouplePixivTagDto,
        updateCouplePixivTagDto: UpdateCouplePixivTagDto,
    ) {
        const coupleTag = await this.CouplePixivTagsRepository.update(
            { date, projectName, type },
            updateCouplePixivTagDto,
        );
        return coupleTag;
    }

    remove({ date, projectName, type }: QueryCouplePixivTagDto) {
        // TODO: 添加废除标记
        return `This action removes a ${date}, ${projectName}, ${type} couplePixivTag`;
    }
}
