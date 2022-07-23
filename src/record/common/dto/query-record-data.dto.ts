/**
 * @file record-data-service 所有的查询接口统一在此维护
 * @param category
 * @param recordType
 * 查询数据库内的 record 所需的参数，category 和 recordType 是基础参数
 * 1. 不同 category 数据是没有比较意义的，因此 category 是必须参数
 * 2. 因为所有的查询都是通过 categoryService ，因此 category 参数在 categoryService 维度就直接省略
 * 3. 不同 recordType 数据是没有比较意义的，因此 recordType 是必须参数
 *
 * 所有查询函数命名中不需要带有 category 或者 recordType，默认需要加上这两个参数
 * @param members
 * members 字段可以兼容单个成员的查询接口，因为衍生关系，所有的接口统一先实现 members，再根据需要实现 member
 * 所有接口参数无需出现 projectName 参数，默认 memberList 都属于同一个 project，直接从第一个 memberInfo 获取 projectName 即可
 * 所有接口无需返回 recordType 字段，和 projectName 一样都在隔离在业务层即可，数据层统一返回 date & records 就行
 * @param from
 * From 参数不可省略，应该由客户端保证传入
 * @param to
 * Find 系列，不需要 category，因为是在自己内部查找，代表着参数全部明确，to不可省略，在 recordService 统一获取默认 to
 * Find 系列，不支持 date 参数，统一为 from，to
 * Query 系列，需要 category，recordService 暴露查询入口统一使用 Query 系列参数，参数可省略，to可省略
 */
import { Category } from '@common/root';
import { MemberCommonInfo } from '@common/member-info';
import { RecordType } from '@common/record';

class FindRecordInRange {
    recordType: RecordType;

    from: string;

    to: string;
}

export class FindMembersRecordInRange extends FindRecordInRange {
    members: MemberCommonInfo[];
}

abstract class QueryRecord {
    category: Category;

    recordType: RecordType;
}

class QueryOneRecord extends QueryRecord {
    date?: string;
}

export class QueryRecordInRange extends QueryRecord {
    from: string;

    to?: string;
}

export class QueryMembersRecordOfDate extends QueryOneRecord {
    members: MemberCommonInfo[];
}

export class QueryMembersRecordInRange extends QueryRecordInRange {
    members: MemberCommonInfo[];
}

export class QueryMemberRecordInRange extends QueryRecordInRange {
    romaName: string;
}

