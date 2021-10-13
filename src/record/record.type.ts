import { ProjectName } from 'src/canon.type';

interface QueryRecordDTO {
    projectName: ProjectName;
    date: string;
}

export interface FindWeekRecord {
    findWeekRecord(param: QueryRecordDTO): Promise<number[]>
}
