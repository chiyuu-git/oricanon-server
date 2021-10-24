import { ProjectName, BasicType } from './root';
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

export type GetMemberInfo<Type extends BasicType> = Type extends BasicType.character
    ? CharacterInfo
    : Type extends BasicType.couple
        ? CoupleInfo
        : Type extends BasicType.seiyuu
            ? SeiyuuInfo
            : never

type ModuleInfoMap<Type extends BasicType> = MemberWeekInfo & GetMemberInfo<Type>

export interface ModuleInfo<Type extends BasicType> {
    projectInfo: ProjectInfo[];
    memberInfo: ModuleInfoMap<Type>[];
}
