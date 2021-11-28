import { BasicType, ProjectName } from './root';

export interface CharacterInfo {
    name: string;
    /**
     * 角色的罗马音简称 e.g: honoka
     */
    romaName: string;
    pixivTag: string;
    supportColor: string;
}
export interface CoupleInfo {
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
    // pixivIntersectionTag 由前两个字段计算得出即可
    // pixivIntersectionTag: string;
}
export interface SeiyuuInfo {
    name: string;
    /**
     * 声优的罗马音简称 e.g: emi
     */
    romaName: string;
    twitterAccount: string;
}

export type MemberBasicInfo<Type extends BasicType> = Type extends BasicType.character
    ? CharacterInfo
    : Type extends BasicType.couple
        ? CoupleInfo
        : Type extends BasicType.seiyuu
            ? SeiyuuInfo
            : never

export type MemberInfoMap<Type extends BasicType > = {
    [romaName in string]: MemberBasicInfo<Type> & {
        projectName: ProjectName;
    }
}
