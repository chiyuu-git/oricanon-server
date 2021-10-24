import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindWeekRecord } from '../record.type';
import { CreateSeiyuuFollowerDto } from './dto/create-seiyuu-follower.dto';
import { QuerySeiyuuFollowerDto } from './dto/query-seiyuu-follower.dto';
import { UpdateSeiyuuFollowerDto } from './dto/update-seiyuu-follower.dto';
import { SeiyuuFollower } from './entities/seiyuu-follower.entity';

@Injectable()
export class SeiyuuFollowerService implements FindWeekRecord {
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

    async findWeekRecord(params: QuerySeiyuuFollowerDto) {
        const seiyuuFollower = await this.repository.find({
            where: params,
        });
        const res = seiyuuFollower[0].records;
        if (res.length > 0) {
            return res;
        }

        return false;
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
    // TODO: 添加废除标记
        return `This action removes a ${date}, ${projectName} seiyuuFollower`;
    }
}
