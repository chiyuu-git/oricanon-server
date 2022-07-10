import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    database: 'canon_event',
    name: 'group_event',
})
export class GroupEvent {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'group_event_id',
    })
    groupEventId: number;

    @Column({
        type: 'int',
        name: 'event_id',
    })
    eventId: number;

    @Column({
        type: 'int',
        name: 'group_id',
    })
    groupId: number;
}
