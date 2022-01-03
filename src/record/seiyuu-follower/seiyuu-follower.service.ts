import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { ProjectName } from '@chiyu-bit/canon.root';
// import { SeiyuuRecordType } from '@chiyu-bit/canon.root/record';
import { RecordDataService } from '../common/record-data-service';
import { QueryOneAggtRecordDto } from '../common/dto/query-record-data.dto';
import { CreateProjectSeiyuuRecordDto } from './dto/create-seiyuu-follower.dto';
import { QuerySeiyuuFollowerDto } from './dto/query-seiyuu-follower.dto';
import { UpdateSeiyuuFollowerDto } from './dto/update-seiyuu-follower.dto';
import { LLNSeiyuu, LLSSeiyuu, LLSSSeiyuu, SeiyuuFollower } from './entities/seiyuu-follower.entity';
import { RecordTypeEntity } from '../common/record-type.entity';
import { MemberRecordEntity } from '../common/record.entity';

@Injectable()
export class SeiyuuFollowerService extends RecordDataService {
    @InjectRepository(LLSSeiyuu)
    LLSSeiyuuRepository: Repository<LLSSeiyuu>;

    @InjectRepository(LLNSeiyuu)
    LLNSeiyuuRepository: Repository<LLNSeiyuu>;

    @InjectRepository(LLSSSeiyuu)
    LLSSSeiyuuRepository: Repository<LLSSSeiyuu>;

    @InjectRepository(RecordTypeEntity)
    recordTypeRepository: Repository<RecordTypeEntity>

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(
        readonly memberInfoService: MemberInfoService,
        @InjectRepository(SeiyuuFollower) repository: Repository<SeiyuuFollower>,
    ) {
        super(repository, memberInfoService);
    }

    getRepositoryByProject(projectName: ProjectName): Repository<MemberRecordEntity> {
        switch (projectName) {
            case ProjectName.lls:
                return this.LLSSeiyuuRepository;
            case ProjectName.lln:
                return this.LLNSeiyuuRepository;
            case ProjectName.llss:
                return this.LLSSSeiyuuRepository;
            default:
                return null;
        }
    }

    async createProjectSeiyuuRecord({ date, projectName, records }: CreateProjectSeiyuuRecordDto) {
        const projectSeiyuuInfo = this.projectMemberListMap[projectName].seiyuus;
        // 现在只有 twitterFollower 一种 类型
        const { recordTypeId } = await this.recordTypeRepository.findOne({
            where: { name: 'twitter_follower' },
        });

        const repository = this.getRepositoryByProject(projectName);

        for (const [i, record] of records.entries()) {
            const { memberId } = projectSeiyuuInfo[i];

            const data = {
                date,
                typeId: recordTypeId,
                memberId,
                record,
            };
            repository.insert(data);
        }
        return `Add new seiyuuFollowerRecord of ${projectName}`;
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

    findOneAggtRecord(params: QueryOneAggtRecordDto): Promise<false | number[]> {
        throw new Error('Method not implemented.');
    }

    async findLatestDailyFetchDate() {
        const seiyuuFollower = await this.LLSSSeiyuuRepository.findOne({
            order: {
                date: 'DESC',
            },
        });
        return seiyuuFollower.date;
    }
}
