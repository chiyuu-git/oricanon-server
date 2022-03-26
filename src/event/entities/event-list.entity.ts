import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    database: 'canon_event',
    name: 'event_list',
})
export class EventList {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'event_id',
    })
    eventId: number;

    @Column({
        type: 'int',
        name: 'type_id',
    })
    typeId: number;

    @Column({
        type: 'date',
    })
    from: string;

    @Column({
        type: 'date',
    })
    to: string;

    @Column({
        type: 'varchar',
    })
    title: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    content: string;

    @Column({
        type: 'json',
        name: 'relative_url_list',
        nullable: true,
    })
    relativeUrlList: string[];

    @Column({
        type: 'text',
        nullable: true,
    })
    remark: string;

    @Column({
        type: 'tinyint',
        name: 'override_priority',
        nullable: true,
    })
    overridePriority: number;
}
