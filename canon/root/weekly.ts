import { ProjectName, BasicType, DateString } from './root';
import { MemberBasicInfo } from './member-list';

interface ProjectInfo {
    projectName: ProjectName;
    projectTotal: number;
    projectWeekIncrement: number;
    projectWeekIncrementRate: string;
}

export type MemberWeeklyInfo = {
    romaName: string;
    record: number;
    weekIncrement: number;
    weekIncrementRate: string;
}

export interface RecordWeeklyInfo {
    range: string;
    projectInfoList: ProjectInfo[];
    memberInfoList: MemberWeeklyInfo[];
}
export interface MemberIncrementInfo {
    date: DateString;
    romaName: string;
    increment: number;
}

export type HistoricalIncrementRank = Record<ProjectName, MemberIncrementInfo[]> & {
    historical: MemberIncrementInfo[];
}
