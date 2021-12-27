import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName } from '@chiyu-bit/canon.root';

@Entity({
    database: 'canon_member',
    name: 'chara_info',
})
export class CharaInfo {
    @Column({
        name: 'project_name',
        enum: ProjectName,
        default: ProjectName.llss,
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
        name: 'pixiv_tag',
    })
    pixivTag;

    @Column({
        type: 'varchar',
        name: 'support_color',
    })
    supportColor;

    @Column({
        type: 'varchar',
        name: 'official_order',
    })
    officialOrder;
}

