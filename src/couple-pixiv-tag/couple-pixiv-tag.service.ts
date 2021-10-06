import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DataService } from 'src/canon.type';
import { CreateCouplePixivTagDto } from './dto/create-couple-pixiv-tag.dto';
import { QueryCouplePixivTagDto } from './dto/query-conpule-pixiv-tag.dto';
import { UpdateCouplePixivTagDto } from './dto/update-couple-pixiv-tag.dto';
import { CouplePixivTag } from './entities/couple-pixiv-tag.entity';

@Injectable()
export class CouplePixivTagService implements DataService<CouplePixivTag> {
    constructor(
        @InjectRepository(CouplePixivTag)
        private repository: Repository<CouplePixivTag>,
    ) {}

    async create(createCouplePixivTagDto: CreateCouplePixivTagDto) {
        await this.repository.insert(createCouplePixivTagDto);
        return 'This action adds a new couplePixivTag';
    }

    findAll() {
        return this.repository.find();
    }

    async find(params: QueryCouplePixivTagDto) {
        const coupleTag = await this.repository.find({
            where: params,
        });
        return coupleTag;
    }

    async findOne({ date, projectName, type }: QueryCouplePixivTagDto) {
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
        { date, projectName, type }: QueryCouplePixivTagDto,
        updateCouplePixivTagDto: UpdateCouplePixivTagDto,
    ) {
        const coupleTag = await this.repository.update(
            { date, projectName, type },
            updateCouplePixivTagDto,
        );
        return coupleTag;
    }

    remove({ date, projectName, type }: QueryCouplePixivTagDto) {
        // TODO: 添加废除标记
        return `This action removes a ${date}, ${projectName}, ${type} couplePixivTag`;
    }

    async findLastFetchDate() {
        const coupleTag = await this.repository.find({
            order: {
                date: 'DESC',
            },
            take: 1,
        });
        return coupleTag[0];
    }
}
