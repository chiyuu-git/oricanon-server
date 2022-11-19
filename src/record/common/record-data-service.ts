/**
 * @file 抽离 RecordDataService 的公共逻辑
 */

import { Repository } from 'typeorm';
import { Category, ProjectName } from '@common/root';
import { RecordType } from '@common/record';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
    FindMembersRecordInRange,
} from './dto/query-record-data.dto';
import { RecordEntity } from './record.entity';
import { RecordTypeEntity } from './record-type.entity';
import { CreateRecordOfProjectDto } from './dto/create-record-data.dto';

interface RecordListStr {
    date: string;
    recordStr: string;
}

/**
 * 以 index 去组织逻辑，认为所有的 favorType 日期是对齐的，一旦爬取就是所有类型一起爬取
 * 同一个 index，相当于是同一天的数据
 */
export type IndexDate = number;

export interface MembersRecordEntity {
    date: string;
    projectName: ProjectName;
    recordType: string;
    records: number[];
}

/**
 * 遍历的形式取决于是否 GROUP BY，
 * 如果类型比较复杂，GROUP BY recordType 类型会很清晰，不需要通过一个 date / recordType map 去汇聚 records
 * 如果类型很简单，GROUP BY 实际上是多了一次循环，需要 split 再 map records。此时不进行 GROUP BY，可以在单次循环生成 records
 */
function formatRangeRecordStr(
    projectRecordStr: RecordListStr[],
    recordType: RecordType,
    projectName: ProjectName,
): MembersRecordEntity[] {
    return projectRecordStr.map(({ date, recordStr }) => ({
        date,
        recordType,
        projectName,
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

    constructor(readonly memberInfoService: MemberInfoService) {}

    /**
     * 各基础类型 service 各自实现该方法，返回真实的 repository
     */
    getRepositoryByProject(projectName: ProjectName): Repository<RecordEntity> {
        throw new Error('Method not implemented.');
    }

    /**
     * 接收 records 数组，为对应 project 的每个 member 创建 record
     * 目前这个方法是直接暴露给前端的接口，所以依然保留 project 的形式
     */
    async createRecordOfProject({
        date,
        projectName,
        recordType,
        records,
        onlyActive,
    }: CreateRecordOfProjectDto) {
        const projectMember = await this.memberInfoService.findProjectMembersOfCategory(
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

            // 检查是否已经存在相同日期和类型的数据且值有意义
            if (memberRecord.length > 0 && memberRecord[0].record) {
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
     * 所有 dateService 的统一查询接口
     */
    async findMembersRecordInRange(
        params: FindMembersRecordInRange,
    ): Promise<null | MembersRecordEntity[]> {
        throw new Error('Method not implemented.');
    }

    /**
     * 所有 memberListDateService 的统一查询接口
     * 查询 date 时，from 与 to 相同
     * 实现为单一接口的好处：
     * 1. 可以统一控制返回值的类型，逻辑更加可控
     * 2. 减少查询参数的类型定义，更加简洁
     */
    async findMembersRangeRecordInDB({
        recordType,
        members,
        from, to,
    }: FindMembersRecordInRange) {
        if (members.length === 0) {
            return null;
        }

        const isCoupleId = this.category === Category.couple;
        const idType = isCoupleId ? 'couple_id' : 'member_id';
        const { projectName } = members[0];
        const repository = this.getRepositoryByProject(projectName);
        const tableName = getRecordTableName(this.category, projectName);
        const memberIdList = members.map(({ memberId }) => memberId);

        const queryStr = `
            SELECT
                DATE_FORMAT(date, '%Y-%m-%d') as date,
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

        return formatRangeRecordStr(projectRecordStr, recordType, projectName);
    }
}
