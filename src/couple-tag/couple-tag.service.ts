import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DataService } from 'src/canon.type';
import { CreateCoupleTagDto } from './dto/create-couple-tag.dto';
import { QueryCoupleTagDto } from './dto/query-conpule-tag.dto';
import { UpdateCoupleTagDto } from './dto/update-couple-tag.dto';
import { CoupleTag } from './entities/couple-tag.entity';

@Injectable()
export class CoupleTagService implements DataService<CoupleTag> {
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

    async find(params: QueryCoupleTagDto) {
        const coupleTag = await this.repository.find({
            where: params,
        });
        return coupleTag;
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
