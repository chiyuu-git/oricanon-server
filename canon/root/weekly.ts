import { ProjectName, BasicType, CharacterRecordType, SeiyuuRecordType, AggregationType } from './root';
import { CharacterInfo, CoupleInfo, SeiyuuInfo } from './member-list';

interface ProjectInfo {
    projectName: ProjectName;
    projectTotal: number;
    projectWeekIncrease: number;
    projectWeekIncreaseRate: string;
}

interface MemberWeekInfo {
    projectName: ProjectName;
    record: number;
    weekIncrease: number;
    weekIncreaseRate: string;
}

export type MemberBasicInfo<Type extends BasicType> = Type extends BasicType.character
    ? CharacterInfo
    : Type extends BasicType.couple
        ? CoupleInfo
        : Type extends BasicType.seiyuu
            ? SeiyuuInfo
            : never

type MemberInfo<Type extends BasicType> = MemberWeekInfo & MemberBasicInfo<Type>

export interface RecordWeeklyInfo<Type extends BasicType> {
    range: string;
    projectInfo: ProjectInfo[];
    memberInfo: MemberInfo<Type>[];
}

export type CharaRecordWeeklyInfo = Record<CharacterRecordType, RecordWeeklyInfo<BasicType.character>>
& Record<AggregationType, RecordWeeklyInfo<BasicType.character>>

export type CoupleRecordWeeklyInfo = Record<CharacterRecordType, RecordWeeklyInfo<BasicType.couple>>
& Record<AggregationType, RecordWeeklyInfo<BasicType.couple>>

export type SeiyuuRecordWeeklyInfo = Record<SeiyuuRecordType, RecordWeeklyInfo<BasicType.seiyuu>>;

export type WeeklyInfo = {
    [BasicType.character]: CharaRecordWeeklyInfo;
    [BasicType.couple]: CoupleRecordWeeklyInfo;
    [BasicType.seiyuu]: SeiyuuRecordWeeklyInfo;
};
