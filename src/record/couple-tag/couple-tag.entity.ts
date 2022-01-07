import { Entity } from 'typeorm';
import { CoupleRecordEntity } from 'src/record/common/record.entity';
import { RECORD_DATA_BASE } from 'src/record/common';

@Entity({ database: RECORD_DATA_BASE, name: 'llss_couple' })
export class LLSSCouple extends CoupleRecordEntity {}
