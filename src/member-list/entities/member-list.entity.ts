import { Column, Entity, PrimaryColumn } from 'typeorm';
import {
    ProjectName,
    List,
    ListType,
} from '../member-list.type';

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
        enum: ListType,
        default: ListType.character,
    })
    type: ListType;

    @Column({ type: 'json' })
    list: List;
}
