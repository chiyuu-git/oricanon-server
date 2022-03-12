import { BasicType, ProjectName } from './root';

interface MemberCommonInfo {
    memberId: number;
    projectName: ProjectName;
    name: string;
    /**
     * 角色的罗马音简称 e.g: honoka
     */
    romaName: string;
}

export interface CharaInfo extends MemberCommonInfo {
    pixivTag: string;
    supportColor: string;
    officialOrder: number;
}
export interface CoupleInfo extends MemberCommonInfo {
    romaName: string;
    pixivTag: string;
    pixivReverseTag: string;
    supportColor: string;
    // pixivIntersectionTag 由前两个字段计算得出即可
    // pixivIntersectionTag: string;
}
export interface SeiyuuInfo extends MemberCommonInfo{
    twitterAccount: string;
    supportColor: string;
    officialOrder: number;
}

export type GetMemberInfoByType<Type extends BasicType> = Type extends BasicType.chara
    ? CharaInfo
    : Type extends BasicType.couple
        ? CoupleInfo
        : Type extends BasicType.seiyuu
            ? SeiyuuInfo
            : never

export type MemberInfoMap<Type extends BasicType > = {
    [romaName in string]: GetMemberInfoByType<Type>
}
