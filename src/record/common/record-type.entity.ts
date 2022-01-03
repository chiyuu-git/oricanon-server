import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
    database: 'canon_record',
    name: 'record_type',
})
export class RecordType {
    @PrimaryColumn({
        type: 'int',
        name: 'type_id',
    })
    recordTypeId: number;

    @Column({
        type: 'varchar',
    })
    name: string;
}

