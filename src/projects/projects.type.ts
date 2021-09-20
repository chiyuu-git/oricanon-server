/**
 * @file projectsModule 下的公共类型
 */

export enum projectName {
    LL = 'lovelive',
    LLS = 'lovelive_sunshine',
    LLSS = 'lovelive_superstar',
    LLN = 'lovelive_nijigasaki_high_school_idol_club',
}

export enum listType {
    CHARACTER = 'character',
    SEIYUU = 'seiyuu',
    CHARACTER_COUPLE = 'characterCouple',
}

interface ICharacter {
    name: string;
    /**
     * 角色的罗马音简称 e.g: honoka
     */
    romaName: string;
    pixivTag: string;
}
interface ICharacterCouple {
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
interface ISeiyuu {
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
export type list = ICharacter[] | ICharacterCouple[] | ISeiyuu[];
