/**
 * @file MemberListsModule 下的公共类型
 */

import { ProjectName, BasicType } from '@chiyu-bit/canon.root';
import { CharacterInfo, CoupleInfo, MemberBasicInfo, SeiyuuInfo } from '@chiyu-bit/canon.root/member-list';

/**
 * List 是三选一类型的数组，使用泛型捕获，获取 BasicType 用于索引 List
 */
export type List = CharacterInfo[] | CoupleInfo[] | SeiyuuInfo[];

export type MemberListType<Type extends BasicType> = {
    projectName: ProjectName;
    type: BasicType.couple;
    list: MemberBasicInfo<Type>[];
};

/**
* 以 projectName 为主要字段整合全部 memberList，其中
* 1. ll 没有 seiyuus 字段
*2.  couples 字段仅 llss 存在
*/
export interface ProjectMemberList {
    projectName: ProjectName;
    characters: CharacterInfo[];
    couples?: CoupleInfo[];
    seiyuus?: SeiyuuInfo[];
}

/**
 * 以 projectName 为属性名整合全部的list
 */
export type ProjectMemberListMap = Record<ProjectName, Partial<ProjectMemberList>>;
