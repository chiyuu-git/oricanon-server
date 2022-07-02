import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    database: 'canon_twitter',
    name: 'platform_type',
})
export class PlatformType {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'type_id',
    })
    id: number;

    @Column()
    name: string;
}
