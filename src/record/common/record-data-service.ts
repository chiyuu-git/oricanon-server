/**
 * @file 抽离 RecordDataService 的公共逻辑
 */

import { Between, Repository } from 'typeorm';
import { ProjectName, RecordType } from '@chiyu-bit/canon.root';
import { QueryOneAggtRecordDto, QueryOneRecordDto, QueryRangeRecordDto } from './dto/query-record-data.dto';

export interface RecordDataEntity {
    date: string;

    projectName: ProjectName;

    recordType: RecordType;

    records: number[];
}

export interface RecordDataUnionKey {
    date: string;

    projectName: ProjectName;

    recordType: RecordType;
}

// TODO: 改造成泛型类，提升 create findOne 等方法？ 会不会导致太复杂了呢？ 万一以后新增更多的种类
export abstract class RecordDataService {
    protected repository: Repository<RecordDataEntity>

    constructor(repository: Repository<RecordDataEntity>) {
        this.repository = repository;
    }

    findAll() {
        return this.repository.find();
    }

    async findOneRecord(params: QueryOneRecordDto) {
        const entity = await this.repository.find({
            where: params,
        });
        if (entity.length === 0) {
            return false;
        }
        return entity[0].records;
    }

    async findRecordInRange(params: QueryRangeRecordDto) {
        const { from, to, projectName, recordType } = params;
        const rangeEntity = await this.repository.find({
            select: ['date', 'records'],
            where: {
                date: Between(from, to),
                projectName,
                recordType,
            },
        });
        return rangeEntity;
    }

    /**
     * 由子类重写的方法
     */
    findOneAggtRecord(params: QueryOneAggtRecordDto): Promise<false | number[]> {
        throw new Error('Method not implemented.');
    }
}
