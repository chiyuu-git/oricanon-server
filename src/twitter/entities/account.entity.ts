import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    database: 'canon_twitter',
    name: 'account',
})
export class Account {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'account_id',
    })
    id: number;

    @Column()
    name: string;
}
