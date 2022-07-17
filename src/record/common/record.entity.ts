import { Column, Entity, PrimaryColumn } from 'typeorm';

export const RECORD_DATA_BASE = 'canon_record';

export abstract class RecordEntity {
    @PrimaryColumn({
        type: 'int',
        name: 'record_id',
    })
    recordId: number;

    @Column({
        type: 'date',
    })
    date: string;

    @Column({
        type: 'int',
        name: 'type_id',
    })
    typeId: number;

    @Column({
        type: 'int',
    })
    record: number;

    memberId: number;
}

export abstract class MemberRecordEntity extends RecordEntity {
    @Column({
        type: 'int',
        name: 'member_id',
    })
    declare memberId: number;
}

export abstract class CoupleRecordEntity extends RecordEntity {
    @Column({
        type: 'int',
        name: 'couple_id',
    })
    declare memberId: number;
}

@Entity({ database: RECORD_DATA_BASE, name: 'rest' })
export class RestMember extends MemberRecordEntity {}
