import { ProjectName } from 'src/canon.type';
import { Character, Couple, Seiyuu } from 'src/member-list/member-list.type';
import { CoupleTagType } from 'src/record/couple-tag/couple-tag.type';

interface ProjectInfo {
    projectName: ProjectName;
    projectTotal: number;
    projectWeekIncrease: number;
    projectIncreaseRate: string;
}

interface MemberWeekInfo {
    projectName: ProjectName;
    record: number;
    weekIncrease: number;
    weekIncreaseRate: string;
}

interface CharacterInfo extends Character, MemberWeekInfo {}

type CoupleTypeRecord = Partial<Record<CoupleTagType, number>>;
interface CoupleInfo extends Couple, MemberWeekInfo, CoupleTypeRecord { }

interface SeiyuuInfo extends Seiyuu, MemberWeekInfo { }

export interface ModuleInfo {
    projectInfo: ProjectInfo[];
    // TODO: 更准确的类型，难点在于处理函数返回值是联合类型
    memberInfo: MemberWeekInfo[];
}

