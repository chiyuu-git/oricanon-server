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
// export type list<T> = T extends ICharacter
//     ? T[]
//     : T extends ISeiyuu
//     ? T[]
//     : T extends ICharacterCouple
//     ? T[]
//     : never;
export type List = Character[] | CharacterCouple[] | Seiyuu[];

/**
 * 以 projectName 为主要字段整合全部 memberList，其中
 * 1. ll 没有 seiyuus 字段
 *2.  couples 字段仅 llss 存在
 */
export interface ListFormatWithProject {
    projectName: ProjectName;
    characters: Character[];
    characterCouples?: CharacterCouple[];
    seiyuus?: Seiyuu[];
}
