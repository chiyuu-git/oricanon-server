import { RECORD_DATA_BASE } from 'src/record/common';
import { MemberRecordEntity } from 'src/record/common/record.entity';
import { Entity } from 'typeorm';

@Entity({ database: RECORD_DATA_BASE, name: 'll_chara' })
export class LLChara extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'lls_chara' })
export class LLSChara extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'lln_chara' })
export class LLNChara extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'llss_chara' })
export class LLSSChara extends MemberRecordEntity {}

