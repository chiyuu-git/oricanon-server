import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { RecordDataService } from '../common/record-data-service';
import { QueryOneAggtRecordDto } from '../common/dto/query-record-data.dto';
import { CreateSeiyuuFollowerDto } from './dto/create-seiyuu-follower.dto';
import { QuerySeiyuuFollowerDto } from './dto/query-seiyuu-follower.dto';
import { UpdateSeiyuuFollowerDto } from './dto/update-seiyuu-follower.dto';
import { LLNSeiyuu, LLSSeiyuu, LLSSSeiyuu, SeiyuuFollower } from './entities/seiyuu-follower.entity';
import { RecordType } from '../common/record-type.entity';

@Injectable()
export class SeiyuuFollowerService extends RecordDataService {
    @InjectRepository(LLSSeiyuu)
    LLSSeiyuuRepository: Repository<LLSSeiyuu>;

    @InjectRepository(LLNSeiyuu)
    LLNSeiyuuRepository: Repository<LLNSeiyuu>;

    @InjectRepository(LLSSSeiyuu)
    LLSSSeiyuuRepository: Repository<LLSSSeiyuu>;

    @InjectRepository(RecordType)
    recordTypeRepository: Repository<RecordType>

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(
    @InjectRepository(SeiyuuFollower) repository: Repository<SeiyuuFollower>,
        readonly memberInfoService: MemberInfoService,
    ) {
        super(repository, memberInfoService);
    }

    async create(createSeiyuuFollowerDto: CreateSeiyuuFollowerDto) {
        await this.repository.insert(createSeiyuuFollowerDto);
        return 'This action adds a new seiyuuFollower';
    }

    async createProjectSeiyuuRecord(dto: CreateSeiyuuFollowerDto) {
        // await this.repository.insert(createCharaRecordDto);
        const seiyuuFollower = await this.findAll();
        const res: any[] = [];
        for (const recordData of seiyuuFollower) {
            const { projectName, date, recordType, records } = recordData;

            if (projectName !== 'lovelive_superstar') {
                // eslint-disable-next-line no-continue
                continue;
            }

            const projectSeiyuuInfo = this.projectMemberListMap[projectName].seiyuus;
            // eslint-disable-next-line no-await-in-loop
            const { recordTypeId } = await this.recordTypeRepository.findOne({
                where: { name: recordType },
            });

            for (const [i, record] of records.entries()) {
                const seiyuuInfo = projectSeiyuuInfo[i];
                const { memberId } = seiyuuInfo;

                const data = {
                    date,
                    typeId: recordTypeId,
                    memberId,
                    record,
                };
                // res.push(data);
                // this.LLSSSeiyuuRepository.insert(data);
            }
        }
        return res;
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
