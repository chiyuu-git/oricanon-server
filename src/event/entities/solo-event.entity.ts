import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    database: 'canon_event',
    name: 'solo_event',
})
export class SoloEvent {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'solo_event_id',
    })
    soloEventId: number;

    @Column({
        type: 'int',
        name: 'event_id',
    })
    eventId: number;

    @Column({
        type: 'int',
        name: 'member_id',
    })
    memberId: number;
}
