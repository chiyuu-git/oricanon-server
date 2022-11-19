import { CharaInfo, CoupleInfo, GetMemberInfoByCategory, MemberCommonInfo } from './member-info';
import { CharaRecordType, GetRecordTypeByCategory } from './record';
import { Category, DateString, ProjectName } from './root';

export interface MemberWeekIncrement {
    date: DateString;
    romaName: string;
    increment: number;
}

export type CategoryIncrementRank = Record<ProjectName, MemberWeekIncrement[]> & {
    historical: MemberWeekIncrement[];
}

/**
 * 总结是使用的精确类型，便于理解，加上了 illust 前缀
 */
export enum SummaryType {
    r18Rate = 'pixiv_illust_r18_rate',
    favorRate = 'pixiv_illust_favor_rate',
}

export const DIMENSION_LIST = [
    CharaRecordType.illust,
    SummaryType.r18Rate,
    SummaryType.favorRate,
    CharaRecordType.novel,
    CharaRecordType.tagView,
] as const;

export const dimensionTitleMap = {
    [CharaRecordType.illust]: '同人图-年增量',
    [SummaryType.r18Rate]: '同人图-年增量-R18率',
    [SummaryType.favorRate]: '同人图-年增量-高收藏率',
    [CharaRecordType.novel]: '同人文-年增量',
    [CharaRecordType.tagView]: '角色作品浏览数-年增量',
} as const;

export interface RecordTypeIncrement {
    recordType: string;
    record: number;
    increment: number;
    /**
     * template: `${record} (${increment})`
     */
    template: string;
}

export type MemberRelativeIncrementInfo<Type extends Category> = GetMemberInfoByCategory<Type>
& Record<GetRecordTypeByCategory<Type>, RecordTypeIncrement>

export type CharaRelativeIncrementInfo = MemberRelativeIncrementInfo<Category.chara>;
export type CoupleRelativeIncrementInfo = MemberRelativeIncrementInfo<Category.couple>;
export type PersonRelativeIncrementInfo = MemberRelativeIncrementInfo<Category.person>;

interface RecordTypeRankInfo {
    recordType: string;
    value: number;
    rank: number;

}

export type MemberIncrementRankInfo =
    MemberCommonInfo
    & Record<CharaRecordType, RecordTypeRankInfo>
    & Record<SummaryType, RecordTypeRankInfo>
