import { Column, PrimaryColumn } from 'typeorm';

abstract class RecordEntity {
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
}

export abstract class MemberRecordEntity extends RecordEntity {
    @Column({
        type: 'int',
        name: 'member_id',
    })
    memberId: number;
}

export abstract class CoupleRecordEntity extends RecordEntity {
    @Column({
        type: 'int',
        name: 'couple_id',
    })
    coupleId: number;
}

