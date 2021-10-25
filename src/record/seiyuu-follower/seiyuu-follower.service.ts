import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindAggregationRecord, FindRecord, QueryAggregationRecordDTO } from '../record.type';
import { CreateSeiyuuFollowerDto } from './dto/create-seiyuu-follower.dto';
import { QuerySeiyuuFollowerDto } from './dto/query-seiyuu-follower.dto';
import { UpdateSeiyuuFollowerDto } from './dto/update-seiyuu-follower.dto';
import { SeiyuuFollower } from './entities/seiyuu-follower.entity';

@Injectable()
export class SeiyuuFollowerService implements FindRecord, FindAggregationRecord {
    constructor(
        @InjectRepository(SeiyuuFollower)
        private repository: Repository<SeiyuuFollower>,
    ) {}

    async create(createSeiyuuFollowerDto: CreateSeiyuuFollowerDto) {
        await this.repository.insert(createSeiyuuFollowerDto);
        return 'This action adds a new seiyuuFollower';
    }

    findAll() {
        return this.repository.find();
    }

    async findRecord(params: QuerySeiyuuFollowerDto) {
        // 过滤掉 recordType seiyuu 目前只有一种
        const { projectName, date } = params;
        const seiyuuFollower = await this.repository.find({
            where: { projectName, date },
        });
        if (seiyuuFollower.length === 0) {
            return false;
        }
        return seiyuuFollower[0].records;
    }

    findAggregationRecord(params: QueryAggregationRecordDTO): Promise<false | number[]> {
        throw new Error('Method not implemented.');
    }

    async findOne({ date, projectName }: QuerySeiyuuFollowerDto) {
        const seiyuuFollower = await this.repository.findOne({
            where: {
                date,
                projectName,
            },
        });
        return seiyuuFollower;
    }

    async update(
        { date, projectName }: QuerySeiyuuFollowerDto,
        updateCharacterTagDto: UpdateSeiyuuFollowerDto,
    ) {
        const seiyuuFollower = await this.repository.update(
            { date, projectName },
            updateCharacterTagDto,
        );
        return seiyuuFollower;
    }

    remove({ date, projectName }: QuerySeiyuuFollowerDto) {
        return `This action removes a ${date}, ${projectName} seiyuuFollower`;
    }
}
