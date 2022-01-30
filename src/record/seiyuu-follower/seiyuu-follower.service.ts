import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { BasicType, ProjectName } from '@common/root';
import {
    QueryOneProjectRecord,
    QueryRangeProjectRecordOfTypeDto,
} from '../common/dto/query-record-data.dto';
import { LLNSeiyuu, LLSSeiyuu, LLSSSeiyuu } from './seiyuu-follower.entity';
import { MemberRecordEntity } from '../common/record.entity';
import { RecordDataService } from '../common/record-data-service';
import { CreateRecordOfProjectDto } from '../common/dto/create-record-data.dto';

@Injectable()
export class SeiyuuFollowerService extends RecordDataService {
    @InjectRepository(LLSSeiyuu)
    LLSSeiyuuRepository: Repository<LLSSeiyuu>;

    @InjectRepository(LLNSeiyuu)
    LLNSeiyuuRepository: Repository<LLNSeiyuu>;

    @InjectRepository(LLSSSeiyuu)
    LLSSSeiyuuRepository: Repository<LLSSSeiyuu>;

    getRepositoryByProject(projectName: ProjectName): Repository<MemberRecordEntity> {
        switch (projectName) {
            case ProjectName.lls:
                return this.LLSSeiyuuRepository;
            case ProjectName.lln:
                return this.LLNSeiyuuRepository;
            case ProjectName.llss:
                return this.LLSSSeiyuuRepository;
            default:
                throw new HttpException(`SeiyuuRepository of ${projectName} not exist`, HttpStatus.NOT_FOUND);
        }
    }

    createSeiyuuRecordOfProject(createProjectSeiyuuRecordDto: CreateRecordOfProjectDto) {
        return this.createRecordOfProject(BasicType.seiyuu, createProjectSeiyuuRecordDto);
    }

    /**
     * findOneSeiyuuProjectRecord
     */
    async findOneProjectRecord(params: QueryOneProjectRecord): Promise<null | number[]> {
        if (params.projectName === ProjectName.ll) {
            return null;
        }

        return this.findOneProjectRecordInDB({
            basicType: BasicType.seiyuu,
            ...params,
        });
    }

    async findRangeBasicTypeProjectRecord(params: QueryRangeProjectRecordOfTypeDto) {
        if (params.projectName === ProjectName.ll) {
            return null;
        }

        // 普通类型 record
        return this.findRangeProjectRecordEntityInDB(BasicType.seiyuu, params);
    }

    async findLatestDailyFetchDate() {
        const seiyuuFollower = await this.LLSSSeiyuuRepository.findOne({
            order: {
                date: 'DESC',
            },
        });

        if (!seiyuuFollower) {
            throw new HttpException('Can not find latest daily fetch date', HttpStatus.NOT_FOUND);
        }

        return seiyuuFollower.date;
    }
}
