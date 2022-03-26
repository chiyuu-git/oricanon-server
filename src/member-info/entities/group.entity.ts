import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    database: 'canon_member',
    name: 'group',
})
export class GroupList {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'group_id',
    })
    groupId: number;

    @Column({ type: 'varchar' })
    name: string;

    @Column({
        type: 'varchar',
        name: 'roma_name',
    })
    romaName: string;

    @Column({
        type: 'varchar',
        name: 'support_color',
    })
    supportColor: string;

    @Column({
        type: 'int',
        name: 'project_id',
    })
    projectId: number;
}

