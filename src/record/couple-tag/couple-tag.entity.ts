import { Entity } from 'typeorm';
import { CoupleRecordEntity, RECORD_DATA_BASE } from 'src/record/common/record.entity';

@Entity({ database: RECORD_DATA_BASE, name: 'couple_llss' })
export class LLSSCouple extends CoupleRecordEntity {}
