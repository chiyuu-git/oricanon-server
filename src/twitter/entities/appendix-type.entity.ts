import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    database: 'canon_twitter',
    name: 'appendix_type',
})
export class AppendixType {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'type_id',
    })
    id: number;

    @Column()
    name: string;
}
