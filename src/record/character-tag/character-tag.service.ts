import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterRecordType, ProjectName } from '@chiyu-bit/canon.root';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { RecordDataService } from '../common/record-data-service';
import { QueryOneAggtRecordDto } from '../common/dto/query-record-data.dto';
import { CreateProjectCharaRecordDto } from './dto/create-character-tag.dto';
import { QueryCharacterTagDto } from './dto/query-character-tag.dto';
import { UpdateCharacterTagDto } from './dto/update-character-tag.dto';
import { CharacterTag, LLChara, LLNChara, LLSChara, LLSSChara } from './entities/character-tag.entity';
import { RecordTypeEntity } from '../common/record-type.entity';
import { MemberRecordEntity } from '../common/record.entity';

@Injectable()
export class CharacterTagService extends RecordDataService {
    @InjectRepository(LLChara)
    LLCharaRepository: Repository<LLChara>;

    @InjectRepository(LLSChara)
    LLSCharaRepository: Repository<LLSChara>;

    @InjectRepository(LLNChara)
    LLNCharaRepository: Repository<LLNChara>;

    @InjectRepository(LLSSChara)
    LLSSCharaRepository: Repository<LLSSChara>;

    @InjectRepository(RecordTypeEntity)
    recordTypeRepository: Repository<RecordTypeEntity>

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(
        readonly memberInfoService: MemberInfoService,
        @InjectRepository(CharacterTag) repository: Repository<CharacterTag>,
        // TODO:问题在于为什么没有帮我注入依赖，需要我手动注入
    ) {
        super(repository, memberInfoService);
    }

    getRepositoryByProject(projectName: ProjectName): Repository<MemberRecordEntity> {
        switch (projectName) {
            case ProjectName.ll:
                return this.LLCharaRepository;
            case ProjectName.lls:
                return this.LLSCharaRepository;
            case ProjectName.lln:
                return this.LLNCharaRepository;
            case ProjectName.llss:
                return this.LLSSCharaRepository;
            default:
                return null;
        }
    }

    async createProjectCharaRecord({ date, projectName, recordType, records }: CreateProjectCharaRecordDto) {
        const projectChara = this.projectMemberListMap[projectName].seiyuus;
        const { recordTypeId } = await this.recordTypeRepository.findOne({
            where: { name: recordType },
        });

        const repository = this.getRepositoryByProject(projectName);

        for (const [i, record] of records.entries()) {
            const seiyuuInfo = projectChara[i];
            const { memberId } = seiyuuInfo;

            const data = {
                date,
                typeId: recordTypeId,
                memberId,
                record,
            };
            repository.insert(data);
        }
    }

    async findOne({ date, projectName, recordType }: QueryCharacterTagDto) {
        const characterTag = await this.repository.findOne({
            where: {
                date,
                projectName,
                recordType,
            },
        });
        return characterTag;
    }

    /**
     * 聚合 illust 和 novel，目前 character 只有一个聚合
     * 之后新增聚合此方法可以作为入口分发
     */
    async findOneAggtRecord(params: QueryOneAggtRecordDto): Promise<false | number[]> {
        // 过滤掉 aggregationType ，获取全部类型的数据，用于聚合
        const { projectName, date } = params;
        const characterRecordArr = await this.repository.find({
            where: { projectName, date },
        });

        if (characterRecordArr.length === 0) {
            return false;
        }

        let illustRecord: number[] = [];
        let novelRecord: number[] = [];
        for (const characterRecord of characterRecordArr) {
            const { recordType, records } = characterRecord;

            switch (recordType) {
                case CharacterRecordType.illust:
                    illustRecord = records;
                    break;
                case CharacterRecordType.novel:
                    novelRecord = records;
                    break;
                default:
            }
        }
        // 聚合 pixiv_illust 和 pixiv_novel
        return illustRecord.map((record, i) => record + novelRecord[i]);
    }

    async findLatestWeeklyFetchDate() {
        const characterTag = await this.repository.findOne({
            order: {
                date: 'DESC',
            },
        });
        return characterTag.date;
    }
}
