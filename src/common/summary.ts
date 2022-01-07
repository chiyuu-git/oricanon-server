import { DateString, ProjectName } from './root';

export interface MemberIncrementInfo {
    date: DateString;
    romaName: string;
    increment: number;
}

export type HistoricalIncrementRank = Record<ProjectName, MemberIncrementInfo[]> & {
    historical: MemberIncrementInfo[];
}
