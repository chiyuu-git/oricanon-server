import { BasicType, ProjectName } from './root';

export interface CharaInfo {
    projectName: ProjectName;
    name: string;
    /**
     * 角色的罗马音简称 e.g: honoka
     */
    romaName: string;
    pixivTag: string;
    supportColor: string;
    officialOrder: number;
}

export interface SeiyuuInfo {
    projectName: ProjectName;
    name: string;
    /**
     * 声优的罗马音简称 e.g: emi
     */
    romaName: string;
    twitterAccount: string;
    supportColor: string;
    officialOrder: number;
}

export interface CoupleInfo {
    projectName: ProjectName;
    /**
     * couple 两名成员的名字拼串而成，按公式顺序开始排列组合
     */
    name: string;
    /**
     * couple romaName 由上述元组拼串组成 e.g: kanon-keke
     */
    romaName: string;
    pixivTag: string;
    pixivReverseTag: string;
    supportColor: string;
    // pixivIntersectionTag 由前两个字段计算得出即可
    // pixivIntersectionTag: string;
}
// TODO: map形式和类型函数形式的区别
export type MemberInfoTypeMap = {
    [BasicType.chara]: CharaInfo;
    [BasicType.seiyuu]: SeiyuuInfo;
    [BasicType.couple]: CoupleInfo;
}

export type MemberBasicInfo<Type extends BasicType> = Type extends BasicType.chara
    ? CharaInfo
    : Type extends BasicType.seiyuu
        ? SeiyuuInfo
        : Type extends BasicType.couple
            ? CoupleInfo
            : never

export type MemberInfoMap<Type extends BasicType > = {
    [romaName in string]: MemberBasicInfo<Type>
}
