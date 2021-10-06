import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName, CoupleTagType } from '../couple-pixiv-tag.type';

@Entity({
    name: 'couple_pixiv_tag',
})
export class CouplePixivTag {
    @PrimaryColumn({
        type: 'date',
        // transformer: {
        //     from(value: string): string {
        //         return value;
        //     },
        //     to(value: string): string {
        //         return formatDate(value);
        //     },
        // },
    })
    // TODO: dateString 类型如何更准确的描述
    date: string;

    @PrimaryColumn({
        type: 'enum',
        name: 'project_name',
        enum: ProjectName,
        default: ProjectName.llss,
    })
    projectName: ProjectName;

    @PrimaryColumn({
        type: 'enum',
        enum: CoupleTagType,
        default: CoupleTagType.default,
    })
    type: CoupleTagType;

    @Column({ type: 'json' })
    tags: number[];
}
