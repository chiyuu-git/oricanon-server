import { Entity } from 'typeorm';
import { MemberRecordEntity, RECORD_DATA_BASE } from 'src/record/common/record.entity';

@Entity({ database: RECORD_DATA_BASE, name: 'person_lls' })
export class LLSPerson extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'person_lln' })
export class LLNPerson extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'person_llss' })
export class LLSSPerson extends MemberRecordEntity {}

