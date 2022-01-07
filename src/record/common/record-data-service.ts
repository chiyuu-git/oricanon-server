/**
 * @file 抽离 RecordDataService 的公共逻辑
 */

import { Repository } from 'typeorm';
import { BasicType, ProjectName } from '@common/root';
import { RecordType } from '@common/record';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { ProjectMemberListMap } from 'src/member-info/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberInfo } from '@src/member-info/entities/member-info.entity';
import {
    QueryOneProjectRecord,
    QueryOneProjectRecordInDB,
    QueryRangeProjectRecordOfTypeDto,
} from './dto/query-record-data.dto';
import { RecordEntity } from './record.entity';
import { RecordTypeEntity } from './record-type.entity';
import { CreateRecordOfProjectDto } from './dto/create-record-data.dto';

interface ProjectRecordStr {
    date: string;
    recordType: string;
    recordStr: string;
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
    @InjectRepository(RecordTypeEntity)
    recordTypeRepository: Repository<RecordTypeEntity>

    // @InjectRepository(RecordTypeEntity)
    // recordTypeRepository: Repository<RecordTypeEntity>

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

    async createRecordOfProject(
        basicType: BasicType,
        { date, projectName, recordType, records }: CreateRecordOfProjectDto,
    ) {
        const projectMember: MemberInfo[] = this.projectMemberListMap[projectName][`${basicType}s`];

        const repository = this.getRepositoryByProject(projectName);
        if (!repository) {
            return `${projectName} do not exists basicType table`;
        }

        const { recordTypeId } = await this.recordTypeRepository.findOne({
            where: { name: recordType },
        });

        for (const [i, record] of records.entries()) {
            const memberInfo = projectMember[i];
            const { memberId } = memberInfo;

            const data = {
                date,
                typeId: recordTypeId,
                memberId,
                record,
            };
            repository.insert(data);
        }

        return `Create new ${recordType} ${basicType}Record of ${projectName}`;
    }

    /**
     * 由各个基础 service 各自实现，查询单个 projectRecord
     */
    async findOneProjectRecord(params: QueryOneProjectRecord): Promise<false | number[]> {
        throw new Error('Method not implemented.');
    }

    /**
     * basicType date projectName recordType 均满足时，仅存在唯一 projectRecordEntity
     */
    async findOneProjectRecordInDB({ basicType, date, projectName, recordType }: QueryOneProjectRecordInDB) {
        const idType = basicType === BasicType.couple ? 'couple_id' : 'member_id';
        const repository = this.getRepositoryByProject(projectName);

        if (!repository) {
            return false;
        }

        // member_id 顺序就是 fetch_order
        const projectRecordStr: ProjectRecordStr[] = await repository.query(`
            SELECT
                '${date}' as date,
                '${recordType}' as recordType,
                GROUP_CONCAT(record ORDER BY ${idType} ASC SEPARATOR ',') as recordStr
            FROM canon_record.${projectName}_${basicType}
            JOIN canon_record.record_type r USING (type_id)
            WHERE date = '${date}' AND r.name = '${recordType}'
            GROUP BY date;
        `);

        if (projectRecordStr.length === 0) {
            return false;
        }

        return formatProjectRecordStr(projectRecordStr)[0].records;
    }

    async findRangeBasicTypeProjectRecord(
        params: QueryRangeProjectRecordOfTypeDto,
    ): Promise<ProjectRecordEntity[]> {
        throw new Error('Method not implemented.');
    }

    /**
     * 返回 false 不如返回空数组
     */
    async findRangeProjectRecordEntityInDB(
        basicType: BasicType,
        { from, to, projectName, recordType }: QueryRangeProjectRecordOfTypeDto,
    ) {
        const idType = basicType === BasicType.couple ? 'couple_id' : 'member_id';

        const repository = this.getRepositoryByProject(projectName);

        if (!repository) {
            return [];
        }

        const projectRecordStr: ProjectRecordStr[] = await repository.query(`
            SELECT
                DATE_FORMAT(date, '%Y-%m-%d') as date,
                '${recordType}' as recordType,
                GROUP_CONCAT(record ORDER BY ${idType} ASC SEPARATOR ',') as recordStr
            FROM canon_record.${projectName}_${basicType}
            JOIN canon_record.record_type r USING (type_id)
            WHERE date BETWEEN '${from}' AND '${to}' AND r.name = '${recordType}'
            GROUP BY date;
        `);

        // TODO: range 系列 稳健性处理，返回 false 更妥当
        if (projectRecordStr.length === 0) {
            return [];
        }

        return formatProjectRecordStr(projectRecordStr);
    }
}
