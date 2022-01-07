import { Entity } from 'typeorm';
import { MemberRecordEntity } from 'src/record/common/record.entity';
import { RECORD_DATA_BASE } from 'src/record/common';

@Entity({ database: RECORD_DATA_BASE, name: 'lls_seiyuu' })
export class LLSSeiyuu extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'lln_seiyuu' })
export class LLNSeiyuu extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'llss_seiyuu' })
export class LLSSSeiyuu extends MemberRecordEntity {}
