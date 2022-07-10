import { MemberRecordEntity, RECORD_DATA_BASE } from 'src/record/common/record.entity';
import { Entity } from 'typeorm';

@Entity({ database: RECORD_DATA_BASE, name: 'chara_ll' })
export class LLChara extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'chara_lls' })
export class LLSChara extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'chara_lln' })
export class LLNChara extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'chara_llss' })
export class LLSSChara extends MemberRecordEntity {}

