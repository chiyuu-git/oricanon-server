import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName } from '@chiyu-bit/canon.root';

export abstract class Member {
    @Column({
        type: 'varchar',
        name: 'project_name',
    })
    projectName: ProjectName;

    @Column({ type: 'varchar' })
    name;

    @PrimaryColumn({
        type: 'varchar',
        name: 'roma_name',
    })
    romaName;

    @Column({
        type: 'varchar',
        name: 'support_color',
    })
    supportColor;
}

