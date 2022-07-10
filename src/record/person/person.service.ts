import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, ProjectName } from '@common/root';
import {
    QueryOneProjectRecordInCategory,
    FindProjectRecordInRange,
} from '../common/dto/query-record-data.dto';
import { LLNPerson, LLSPerson, LLSSPerson } from './person.entity';
import { MemberRecordEntity, RestMember } from '../common/record.entity';
import { RecordDataService } from '../common/record-data-service';

@Injectable()
export class PersonFollowerService extends RecordDataService {
    category = Category.person

    @InjectRepository(LLSPerson)
    LLSPersonRepository: Repository<LLSPerson>;

    @InjectRepository(LLNPerson)
    LLNPersonRepository: Repository<LLNPerson>;

    @InjectRepository(LLSSPerson)
    LLSSPersonRepository: Repository<LLSSPerson>;

    @InjectRepository(RestMember)
    RestMemberRepository: Repository<RestMember>;

    getRepositoryByProject(projectName: ProjectName): Repository<MemberRecordEntity> {
        switch (projectName) {
            case ProjectName.lls:
                return this.LLSPersonRepository;
            case ProjectName.lln:
                return this.LLNPersonRepository;
            case ProjectName.llss:
                return this.LLSSPersonRepository;
            default:
                return this.RestMemberRepository;
        }
    }

    /**
     * findOnePersonProjectRecord
     */
    async findOneProjectRecord(params: QueryOneProjectRecordInCategory): Promise<null | number[]> {
        if (params.projectName === ProjectName.ll) {
            return null;
        }

        return this.findOneProjectRecordInDB(params);
    }

    async findProjectRecordInRange(params: FindProjectRecordInRange) {
        if (params.projectName === ProjectName.ll) {
            return null;
        }

        // 普通类型 record
        return this.findRangeProjectRecordInDB(params);
    }

    async findLatestDailyFetchDate() {
        const personFollower = await this.LLSSPersonRepository.findOne({
            order: {
                date: 'DESC',
            },
        });

        if (!personFollower) {
            throw new HttpException('Can not find latest daily fetch date', HttpStatus.NOT_FOUND);
        }

        return personFollower.date;
    }
}
