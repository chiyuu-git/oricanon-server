/**
 * @file MemberListsModule 下的公共类型
 */

export enum ProjectName {
    ll = 'lovelive',
    lls = 'lovelive_sunshine',
    llss = 'lovelive_superstar',
    lln = 'lovelive_nijigasaki_high_school_idol_club',
}

export enum ListType {
    character = 'character',
    seiyuu = 'seiyuu',
    characterCouple = 'characterCouple',
}

export interface Character {
    name: string;
    /**
     * 角色的罗马音简称 e.g: honoka
     */
    romaName: string;
    pixivTag: string;
}
export interface CharacterCouple {
    /**
     * couple 元组由两名成员组成，按公式顺序开始排列组合
     */
    couple: [string, string];
    /**
     * couple romaName 由上述元组拼串组成 e.g: kanon-keke
     */
    romaName: string;
    pixivTag: string;
    pixivReverseTag: string;
    // intersectionTag 由前两个字段计算得出即可
    // pixivIntersectionTag: string;
}
export interface Seiyuu {
    name: string;
    /**
     * 声优的罗马音简称 e.g: emi
     */
    romaName: string;
    twitterAccount: string;
}

/**
 * list是三选一类型的数组
 */

export type List = Character[] | CharacterCouple[] | Seiyuu[];

export interface CharacterMemberList {
    projectName: ProjectName;
    listType: ListType.character;
    list: Character[];
}
export interface CharacterCoupleMemberList {
    projectName: ProjectName;
    listType: ListType.characterCouple;
    list: CharacterCouple[];
}
export interface SeiyuuMemberList {
    projectName: ProjectName;
    listType: ListType.seiyuu;
    list: Seiyuu[];
}

export interface MemberListType {
    [ListType.character]: CharacterMemberList;
    [ListType.seiyuu]: SeiyuuMemberList;
    [ListType.characterCouple]: CharacterCoupleMemberList;
}
