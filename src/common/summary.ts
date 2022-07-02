import { CharaInfo } from './member-info';
import { CharaRecordType } from './record';
import { DateString, ProjectName } from './root';

export interface MemberIncrementInfo {
    date: DateString;
    romaName: string;
    increment: number;
}

export type HistoricalIncrementRank = Record<ProjectName, MemberIncrementInfo[]> & {
    historical: MemberIncrementInfo[];
}

/**
 * 总结是使用的精确类型，便于理解，加上了 illust 前缀
 */
export enum SummaryRecordType {
    r18Rate = 'pixiv_illust_r18_rate',
    favorRate = 'pixiv_illust_favor_rate',
}

export const DIMENSION_LIST = [
    CharaRecordType.illust,
    SummaryRecordType.r18Rate,
    SummaryRecordType.favorRate,
    CharaRecordType.novel,
    CharaRecordType.tagView,
] as const;

export const dimensionTitleMap = {
    [CharaRecordType.illust]: '同人图-年增量',
    [SummaryRecordType.r18Rate]: '同人图-年增量-R18率',
    [SummaryRecordType.favorRate]: '同人图-年增量-高收藏率',
    [CharaRecordType.novel]: '同人文-年增量',
    [CharaRecordType.tagView]: '角色作品浏览数-年增量',
} as const;

export type CharaMemberIncrementInfo =
    CharaInfo
    & Record<CharaRecordType, number>
    & Record<SummaryRecordType, number>

interface RecordTypeRankInfo {
    recordType: string;
    value: number;
    rank: number;

}

export type CharaMemberIncrementRankInfo =
    CharaInfo
    & Record<CharaRecordType, RecordTypeRankInfo>
    & Record<SummaryRecordType, RecordTypeRankInfo>
