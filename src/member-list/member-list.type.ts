/**
 * @file MemberListsModule 下的公共类型
 */

import { ProjectName } from '../canon.type';

export { ProjectName } from '../canon.type';

export enum ListType {
    character = 'character',
    seiyuu = 'seiyuu',
    couple = 'couple',
}

export interface Character {
    name: string;
    /**
     * 角色的罗马音简称 e.g: honoka
     */
    romaName: string;
    pixivTag: string;
}
export interface Couple {
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
    // pixivIntersectionTag 由前两个字段计算得出即可
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

export type List = Character[] | Couple[] | Seiyuu[];

export interface MemberListTypeMap {
    [ListType.character]: {
        projectName: ProjectName;
        listType: ListType.character;
        list: Character[];
    };
    [ListType.seiyuu]: {
        projectName: ProjectName;
        listType: ListType.seiyuu;
        list: Seiyuu[];
    };
    [ListType.couple]: {
        projectName: ProjectName;
        listType: ListType.couple;
        list: Couple[];
    };
}

/**
* 以 projectName 为主要字段整合全部 memberList，其中
* 1. ll 没有 seiyuus 字段
*2.  couples 字段仅 llss 存在
*/
export interface ProjectMemberList {
   projectName: ProjectName;
   characters: Character[];
   couples?: Couple[];
   seiyuus?: Seiyuu[];
}

/**
 * 以 projectName 为属性名整合全部的list
 */
export type ProjectMemberListMap = Record<ProjectName, Partial<ProjectMemberList>>;