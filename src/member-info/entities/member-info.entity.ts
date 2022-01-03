import { Column } from 'typeorm';
import { ProjectName } from '@chiyu-bit/canon.root';

export abstract class MemberInfo {
    @Column({
        type: 'varchar',
        name: 'project_name',
    })
    projectName: ProjectName;

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
}

