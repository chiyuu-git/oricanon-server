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
    FindMemberRecordInRange,
    FindMemberListRecordInRange,
    QueryMemberListRecordInCategory,
    FindMemberListRecord,
} from './dto/query-record-data.dto';
import { RecordEntity } from './record.entity';
import { RecordTypeEntity } from './record-type.entity';
import { CreateRecordOfProjectDto } from './dto/create-record-data.dto';

interface RecordListStr {
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
function formatRecordListStr(projectRecordStr: RecordListStr[]): ProjectRecordEntity[] {
    return projectRecordStr.map(({ date, recordType, recordStr }) => ({
        date,
        recordType,
        records: recordStr.split(',').map((val) => +val),
    }));
}

/**
 * 根据 category 和 projectName 返回数据表名
 * 其中 person 类型还有 rest_member_record
 */
function getRecordTableName(category: Category, projectName: ProjectName) {
    if (projectName === ProjectName.rest) {
        return projectName;
    }

    return `${category}_${projectName}`;
}

export interface RecordDataEntity {
    date: string;

    projectName: ProjectName;

    recordType: RecordType;

    records: number[];
}

@Injectable()
export class RecordDataService {
    category: Category;

    @InjectRepository(RecordTypeEntity)
    recordTypeRepository: Repository<RecordTypeEntity>

    projectMemberListMap: ProjectMemberListMap;

    constructor(readonly memberInfoService: MemberInfoService) {}

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
        onlyActive,
    }: CreateRecordOfProjectDto) {
        const projectMember = await this.memberInfoService.findProjectMemberListOfCategory(
            this.category,
            projectName,
            { onlyActive },
        );

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

        for (const [i, record] of records.entries()) {
            const memberInfo = projectMember[i];
            const { memberId } = memberInfo;

            // eslint-disable-next-line no-await-in-loop
            const memberRecord = await repository.find({
                date,
                typeId,
                memberId,
            });

            // 检查是否已经存在相同日期和类型的数据
            if (memberRecord.length > 0) {
                // eslint-disable-next-line no-continue
                continue;
            }

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
     * 由各个基础 service 各自实现，查询单个 memberListRecord
     */
    async findMemberListRecord(params: QueryMemberListRecordInCategory): Promise<null | number[]> {
        throw new Error('Method not implemented.');
    }

    /**
     * category date projectName recordType 均满足时，仅存在唯一 projectRecordEntity，获取相应的 memberListRecord
     */
    async findMemberListRecordInDB({
        recordType,
        projectName,
        memberList,
        date,
    }: FindMemberListRecord) {
        const isCoupleId = this.category === Category.couple;
        const idType = isCoupleId ? 'couple_id' : 'member_id';
        const repository = this.getRepositoryByProject(projectName);
        const tableName = getRecordTableName(this.category, projectName);
        const memberIdList = memberList.map(({ memberId }) => memberId);

        // member_id 顺序就是 fetch_order
        const memberListRecordStr: RecordListStr[] = await repository.query(`
                SELECT
                    '${date}' as date,
                    '${recordType}' as recordType,
                    GROUP_CONCAT(record ORDER BY ${idType} ASC SEPARATOR ',') as recordStr
                FROM canon_record.${tableName}
                JOIN canon_record.record_type t USING (type_id)
                JOIN canon_member.${this.category}_info m USING (${idType})
                WHERE date = '${date}' AND t.name = '${recordType}' AND ${idType} IN (${memberIdList})
                GROUP BY date;
            `);

        if (memberListRecordStr.length === 0) {
            return null;
        }

        return formatRecordListStr(memberListRecordStr)[0].records;
    }

    /**
     * 获取指定日期内该企划所有 record
     * 查询参数：基础类型、企划、recordType、range
     */
    async findMemberListRecordInRange(
        params: FindMemberListRecordInRange,
    ): Promise<null | ProjectRecordEntity[]> {
        throw new Error('Method not implemented.');
    }

    async findRangeProjectRecordInDB({
        projectName,
        memberList,
        recordType,
        from, to,
    }: FindMemberListRecordInRange) {
        const isCoupleId = this.category === Category.couple;
        const idType = isCoupleId ? 'couple_id' : 'member_id';
        const repository = this.getRepositoryByProject(projectName);
        const tableName = getRecordTableName(this.category, projectName);
        const memberIdList = memberList.map(({ memberId }) => memberId);

        const queryStr = `
            SELECT
                DATE_FORMAT(date, '%Y-%m-%d') as date,
                '${recordType}' as recordType,
                GROUP_CONCAT(record ORDER BY ${idType} ASC SEPARATOR ',') as recordStr
            FROM canon_record.${tableName}
            JOIN canon_record.record_type t USING (type_id)
            JOIN canon_member.${this.category}_info m USING (${idType})
            WHERE date BETWEEN '${from}' 
                AND '${to}' 
                AND t.name = '${recordType}'
                AND ${idType} IN (${memberIdList})
            GROUP BY date;
        `;
        // console.log('queryStr:', queryStr);
        const projectRecordStr: RecordListStr[] = await repository.query(queryStr);

        if (projectRecordStr.length === 0) {
            return null;
        }

        return formatRecordListStr(projectRecordStr);
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
