/**
 * @file 抽离 RecordDataService 的公共逻辑
 */

import { Between, Repository } from 'typeorm';
import { ProjectName, RecordType } from '@chiyu-bit/canon.root';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MemberInfoService } from 'src/member-info/member-info.service';
import { ProjectMemberListMap } from 'src/member-info/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryOneAggtRecordDto, QueryOneRecordDto, QueryRangeRecordDto } from './dto/query-record-data.dto';
import { RecordTypeEntity } from './record-type.entity';

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

// TODO: 改造成泛型类，传入实体，提升 create findOne 等方法？ 会不会导致太复杂了呢？ 万一以后新增更多的种类
@Injectable()
export class RecordDataService implements OnApplicationBootstrap {
    protected repository: Repository<RecordDataEntity>

    // @InjectRepository(RecordTypeEntity)
    // recordTypeRepository: Repository<RecordTypeEntity>

    projectMemberListMap: ProjectMemberListMap;

    constructor(
        repository: Repository<RecordDataEntity>,
        readonly memberInfoService: MemberInfoService,
    ) {
        this.repository = repository;
        this.memberInfoService = memberInfoService;
    }

    /**
     * 生命周期 初始化
     */
    async onApplicationBootstrap() {
        this.projectMemberListMap = await this.memberInfoService.formatListWithProject();
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
