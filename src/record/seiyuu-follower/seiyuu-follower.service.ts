import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordDataService } from '../common/record-data-service';
import { QueryOneAggtRecordDto } from '../common/dto/query-record-data.dto';
import { CreateSeiyuuFollowerDto } from './dto/create-seiyuu-follower.dto';
import { QuerySeiyuuFollowerDto } from './dto/query-seiyuu-follower.dto';
import { UpdateSeiyuuFollowerDto } from './dto/update-seiyuu-follower.dto';
import { SeiyuuFollower } from './entities/seiyuu-follower.entity';

@Injectable()
export class SeiyuuFollowerService extends RecordDataService {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(@InjectRepository(SeiyuuFollower) repository: Repository<SeiyuuFollower>) {
        super(repository);
    }

    async create(createSeiyuuFollowerDto: CreateSeiyuuFollowerDto) {
        await this.repository.insert(createSeiyuuFollowerDto);
        return 'This action adds a new seiyuuFollower';
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

    findOneAggtRecord(params: QueryOneAggtRecordDto): Promise<false | number[]> {
        throw new Error('Method not implemented.');
    }

    async findLatestDailyFetchDate() {
        const seiyuuFollower = await this.repository.findOne({
            order: {
                date: 'DESC',
            },
        });
        return seiyuuFollower.date;
    }
}
