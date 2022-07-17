import { Category, ProjectName } from '@common/root';
import { MemberCommonInfo } from '@common/member-info';
import { RecordType } from '@common/record';

/**
 * 查询数据库内的 record 所需的参数，category 和 recordType 是基础参数
 * 1. 不同 category 数据是没有比较意义的，因此 category 是必须参数
 * 2. 因为所有的查询都是通过 cateGoryService ，因此 category 参数在 recordService 维度就直接省略
 * 3. 不同 recordType 数据是没有比较意义的，因此 recordType 是必须参数
 *
 * 所有查询函数命名中不需要带有 category 或者 recordType，默认需要加上这两个参数
 *
 * Find 系列，不需要 category，因为是在自己内部查找，代表着参数全部明确，to不可省略，在 recordService 统一获取默认 to
 * Query 系列，需要 category，recordService 暴露查询入口统一使用 Query 系列参数，参数可省略，to可省略
 * QUery Dto 系列，controller 使用，带有类型校验
 *
 * From 参数不可省略，应该由客户端保证传入
 */
abstract class FindRecordInDBParams {
    projectName: ProjectName;

    recordType: RecordType;

    date: string;
}

export class FindMemberListRecord extends FindRecordInDBParams {
    memberList: MemberCommonInfo[];
}

class FindRecordInRange {
    recordType: RecordType;

    from: string;

    to: string;
}

export class FindMemberListRecordInRange extends FindRecordInRange {
    projectName: ProjectName;

    memberList: MemberCommonInfo[];
}
export class FindMemberRecordInRange extends FindRecordInRange {
    romaName: string;
}

abstract class QueryRecord {
    category: Category;

    recordType: RecordType;
}

export class QueryOneRecord extends QueryRecord {
    date?: string;
}

export class QueryMemberListRecord extends QueryOneRecord {
    projectName: ProjectName;

    memberList: MemberCommonInfo[];
}

export class QueryRecordInRange extends QueryRecord {
    from: string;

    to?: string;
}

export class QueryProjectRecordInRange extends QueryRecordInRange {
    projectName: ProjectName;
}

export class QueryMemberListRecordInRange extends QueryRecordInRange {
    projectName: ProjectName;

    memberList: MemberCommonInfo[];
}

export class QueryMemberRecordInRange extends QueryRecordInRange {
    romaName: string;
}

/**
 * 在某个基础类别下，查询单个 projectRecord 需要 date、projectName、recordType 三个参数
 */
export class QueryMemberListRecordInCategory {
    date: string;

    projectName: ProjectName;

    recordType: RecordType;

    memberList: MemberCommonInfo[];
}
