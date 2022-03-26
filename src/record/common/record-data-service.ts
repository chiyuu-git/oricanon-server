/**
 * @file 抽离 RecordDataService 的公共逻辑
 */

import { Repository } from 'typeorm';
import { Category, ProjectName } from '@common/root';
import { RecordType } from '@common/record';
import { HttpException, HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { ProjectMemberListKey, ProjectMemberListMap } from 'src/member-info/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    QueryOneProjectRecordOfType,
    FindOneProjectRecord,
    FindMemberRecordInRange,
    FindProjectRecordInRange,
} from './dto/query-record-data.dto';
import { RecordEntity } from './record.entity';
import { RecordTypeEntity } from './record-type.entity';
import { CreateRecordOfProjectDto } from './dto/create-record-data.dto';

interface ProjectRecordStr {
    date: string;
    recordType: string;
    recordStr: string;
}

export interface MemberRecordEntity {
    date: string;
    recordType: string;
    record: number;
}

export interface ProjectRecordEntity {
    date: string;
    recordType: string;
    records: number[];
}
/**
 * 遍历的形式取决于是否 GROUP BY，
 * 如果类型比较复杂，GROUP BY recordType 类型会很清晰，不需要通过一个 date / recordType map 去汇聚 records
 * 如果类型很简单，GROUP BY 实际上是多了一次循环，需要 split 再 map records。此时不进行 GROUP BY，可以在单次循环生成 records
 */
function formatProjectRecordStr(projectRecordStr: ProjectRecordStr[]): ProjectRecordEntity[] {
    return projectRecordStr.map(({ date, recordType, recordStr }) => ({
        date,
        recordType,
        records: recordStr.split(',').map((val) => +val),
    }));
}

export interface RecordDataEntity {
    date: string;

    projectName: ProjectName;

    recordType: RecordType;

    records: number[];
}

// TODO: 改造成泛型类，传入准确的实体
@Injectable()
export class RecordDataService implements OnApplicationBootstrap {
    category: Category;

    @InjectRepository(RecordTypeEntity)
    recordTypeRepository: Repository<RecordTypeEntity>

    projectMemberListMap: ProjectMemberListMap;

    constructor(readonly memberInfoService: MemberInfoService) {}

    /**
     * 生命周期 初始化
     */
    async onApplicationBootstrap() {
        this.projectMemberListMap = await this.memberInfoService.formatListWithProject();
    }

    /**
     * 各基础类型 service 各自实现该方法，返回真实的 repository
     */
    getRepositoryByProject(projectName: ProjectName): Repository<RecordEntity> {
        throw new Error('Method not implemented.');
    }

    async createRecordOfProject({
        date,
        projectName,
        recordType,
        records,
    }: CreateRecordOfProjectDto) {
        // eslint-disable-next-line max-len
        const projectMember = this.projectMemberListMap[projectName][`${this.category}s` as ProjectMemberListKey];

        if (!projectMember) {
            throw new HttpException(`Record of ${this.category} and ${projectName} not exist`, HttpStatus.NOT_FOUND);
        }

        const repository = this.getRepositoryByProject(projectName);

        const recordTypeEntity = await this.recordTypeRepository.findOne({
            where: { name: recordType },
        });

        if (!recordTypeEntity) {
            throw new HttpException(`RecordType of ${recordType} not exist`, HttpStatus.NOT_FOUND);
        }

        const typeId = recordTypeEntity.recordTypeId;

        // 检查是否已经存在相同日期和类型的数据
        const result = await repository.find({
            date,
            typeId,
        });

        if (result.length > 0) {
            throw new HttpException(
                `Record of ${projectName} ${recordType} in ${date} is already exist`,
                HttpStatus.FORBIDDEN,
            );
        }

        for (const [i, record] of records.entries()) {
            const memberInfo = projectMember[i];
            const { memberId } = memberInfo;

            const data = {
                date,
                typeId,
                memberId,
                record,
            };
            repository.insert(data);
        }

        return `Create new ${recordType} ${this.category}Record of ${projectName}`;
    }

    /**
     * 由各个基础 service 各自实现，查询单个 projectRecord
     */
    async findOneProjectRecord(params: QueryOneProjectRecordOfType): Promise<null | number[]> {
        throw new Error('Method not implemented.');
    }

    /**
     * category date projectName recordType 均满足时，仅存在唯一 projectRecordEntity
     */
    async findOneProjectRecordInDB({ recordType, date, projectName }: FindOneProjectRecord) {
        const idType = this.category === Category.couple ? 'couple_id' : 'member_id';
        const repository = this.getRepositoryByProject(projectName);

        // member_id 顺序就是 fetch_order
        const projectRecordStr: ProjectRecordStr[] = await repository.query(`
            SELECT
                '${date}' as date,
                '${recordType}' as recordType,
                GROUP_CONCAT(record ORDER BY ${idType} ASC SEPARATOR ',') as recordStr
            FROM canon_record.${projectName}_${this.category}
            JOIN canon_record.record_type t USING (type_id)
            WHERE date = '${date}' AND t.name = '${recordType}'
            GROUP BY date;
        `);

        if (projectRecordStr.length === 0) {
            return null;
        }

        return formatProjectRecordStr(projectRecordStr)[0].records;
    }

    /**
     * 获取指定日期内该企划所有 record
     * 查询参数：基础类型、企划、recordType、range
     */
    async findProjectRecordInRange(
        params: FindProjectRecordInRange,
    ): Promise<null | ProjectRecordEntity[]> {
        throw new Error('Method not implemented.');
    }

    async findRangeProjectRecordInDB({
        from, to,
        projectName,
        recordType,
    }: FindProjectRecordInRange) {
        const idType = this.category === Category.couple ? 'couple_id' : 'member_id';

        const repository = this.getRepositoryByProject(projectName);

        const queryStr = `
            SELECT
                DATE_FORMAT(date, '%Y-%m-%d') as date,
                '${recordType}' as recordType,
                GROUP_CONCAT(record ORDER BY ${idType} ASC SEPARATOR ',') as recordStr
            FROM canon_record.${projectName}_${this.category}
            JOIN canon_record.record_type t USING (type_id)
            WHERE date BETWEEN '${from}' AND '${to}' AND t.name = '${recordType}'
            GROUP BY date;
        `;
        // console.log('queryStr:', queryStr);
        const projectRecordStr: ProjectRecordStr[] = await repository.query(queryStr);

        if (projectRecordStr.length === 0) {
            return null;
        }

        return formatProjectRecordStr(projectRecordStr);
    }

    async findMemberRecordInRange({
        from, to,
        romaName,
        recordType,
    }: FindMemberRecordInRange) {
        const idType = this.category === Category.couple ? 'couple_id' : 'member_id';

        // 根据 category 和 romaName 查找 project，获取 repository
        const { projectName, memberId } = await this.memberInfoService.findMemberInfoByRomaName(
            this.category,
            romaName,
        );
        const repository = this.getRepositoryByProject(projectName);

        const queryStr = `
            SELECT
                DATE_FORMAT(date, '%Y-%m-%d') as date,
                '${recordType}' as recordType,
                record
            FROM canon_record.${projectName}_${this.category} r
            JOIN canon_record.record_type t USING (type_id)
            WHERE date
                BETWEEN '${from}' AND '${to}'
                AND t.name = '${recordType}'
                AND r.${idType} = ${memberId}
        `;
        const memberRecordList: MemberRecordEntity[] = await repository.query(queryStr);

        return memberRecordList;
    }
}
