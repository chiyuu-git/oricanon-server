import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    database: 'canon_root',
    name: 'project',
})
export class ProjectList {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'project_id',
    })
    projectId: number;

    @Column({ type: 'varchar' })
    name: string;

    @Column({
        type: 'varchar',
        name: 'full_name',
    })
    fullName: string;
}

