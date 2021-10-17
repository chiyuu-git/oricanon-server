enum ProjectName {
    ll = 'lovelive',
    lls = 'lovelive_sunshine',
    llss = 'lovelive_superstar',
    lln = 'lovelive_nijigasaki_high_school_idol_club',
}

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

export interface ModuleInfo {
    projectInfo: ProjectInfo[];
    // TODO: 更准确的类型，难点在于处理函数返回值是联合类型
    memberInfo: MemberWeekInfo[];
}
