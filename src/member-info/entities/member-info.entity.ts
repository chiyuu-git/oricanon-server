import { Column } from 'typeorm';
import { ProjectName } from '@common/root';

export abstract class MemberInfo {
    memberId: number;

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

