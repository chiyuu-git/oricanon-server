import { RecordType, ProjectName } from '@chiyu-bit/canon.root';

interface QueryWeekRecordDTO {
    projectName: ProjectName;
    date: string;
}

export interface FindWeekRecord {
    findWeekRecord(param: QueryWeekRecordDTO): Promise<false | number[]>;
}

export interface QueryRecordDTO {
    projectName: ProjectName;
    type: RecordType;
    date: string;
}

export interface FindRecord {
    findRecord(params: QueryRecordDTO): Promise<false | number[]>;
}
