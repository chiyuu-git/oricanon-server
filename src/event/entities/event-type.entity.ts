import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EventList } from './event-list.entity';

@Entity({
    database: 'canon_event',
    name: 'event_type',
})
export class EventType {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'type_id',
    })
    typeId: number;

    @Column({
        type: 'varchar',
    })
    name: string;

    @Column({
        type: 'tinyint',
    })
    priority: number;
}
