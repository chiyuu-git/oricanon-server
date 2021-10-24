import { RecordType, ProjectName, InfoType, AggregationType } from '@chiyu-bit/canon.root';

export interface QueryRecordDTO {
    projectName: ProjectName;
    date: string;
    infoType: RecordType;
}
export interface QueryAggregationRecordDTO {
    projectName: ProjectName;
    date: string;
    infoType?: AggregationType;
}

export interface FindRecord {
    findRecord(params: QueryRecordDTO): Promise<false | number[]>;
}
export interface FindAggregationRecord {
    findAggregationRecord(params: QueryAggregationRecordDTO): Promise<false | number[]>;
}
