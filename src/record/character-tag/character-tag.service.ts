import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterRecordType } from '@chiyu-bit/canon.root';
import { RecordDataService } from '../common/record-data-service';
import { QueryOneAggtRecordDto } from '../common/dto/query-record-data.dto';
import { CreateCharacterTagDto } from './dto/create-character-tag.dto';
import { QueryCharacterTagDto } from './dto/query-character-tag.dto';
import { UpdateCharacterTagDto } from './dto/update-character-tag.dto';
import { CharacterTag } from './entities/character-tag.entity';

@Injectable()
export class CharacterTagService extends RecordDataService {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(@InjectRepository(CharacterTag) repository: Repository<CharacterTag>) {
        super(repository);
    }

    async create(createCoupleTagDto: CreateCharacterTagDto) {
        await this.repository.insert(createCoupleTagDto);
        return 'This action adds a new characterTag';
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

    async update(
        { date, projectName, recordType }: QueryCharacterTagDto,
        updateCharacterTagDto: UpdateCharacterTagDto,
    ) {
        const characterTag = await this.repository.update(
            { date, projectName, recordType },
            updateCharacterTagDto,
        );
        return characterTag;
    }

    remove({ date, projectName, recordType }: QueryCharacterTagDto) {
        return `This action removes a ${date}, ${projectName}, ${recordType} characterTag`;
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
