import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName } from '@chiyu-bit/canon.root';

@Entity({
    database: 'canon_member',
    name: 'chara_couple_info',
})
export class CoupleInfo {
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
        name: 'pixiv_reverse_tag',
    })
    pixivReverseTag;

    @Column({
        type: 'varchar',
        name: 'support_color',
    })
    supportColor;
}
