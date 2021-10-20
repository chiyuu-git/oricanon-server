import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName, BasicType } from '@chiyu-bit/canon.root';
import { List } from '../member-list.type';

@Entity({
    name: 'member_list',
})
export class MemberList {
    @PrimaryColumn({
        type: 'enum',
        name: 'project_name',
        enum: ProjectName,
        default: ProjectName.llss,
    })
    projectName: ProjectName;

    @PrimaryColumn({
        type: 'enum',
        enum: BasicType,
        default: BasicType.character,
    })
    type: BasicType;

    @Column({ type: 'json' })
    list: List;
}
