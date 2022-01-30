import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
    database: 'canon_member',
    name: 'member',
})
export class MemberList {
    @PrimaryColumn({
        type: 'int',
        name: 'member_id',
    })
    memberId: number;

    @Column({
        type: 'tinyint',
        name: 'project_id',
    })
    projectId: number;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar' })
    romaName: string;
}

