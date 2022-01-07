import { ProjectName } from './root';

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

