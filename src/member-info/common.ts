import type { Category, ProjectName } from '@common/root';
import type { CharaInfo } from './entities/chara-info.entity';
import type { CoupleInfo } from './entities/couple-info.entity';
import type { PersonInfo } from './entities/person-info.entity';

/**
* 以 projectName 为主要字段整合全部 memberList，其中
* 1. ll 没有 persons 字段
*2.  couples 字段仅 llss 存在
*/
interface ProjectMemberList {
    projectName: ProjectName;
    charas: CharaInfo[];
    couples?: CoupleInfo[];
    persons?: PersonInfo[];
}

export type ProjectMemberListKey = `${Category}s`;

/**
 * 以 projectName 为属性名整合全部的list
 */
export type ProjectMemberListMap = Record<ProjectName, ProjectMemberList>;
