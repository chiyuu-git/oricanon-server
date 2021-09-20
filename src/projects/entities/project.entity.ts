import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName, List, ListType } from '../projects.type';

@Entity()
export class Project {
    @PrimaryColumn({
        type: 'enum',
        name: 'project_name',
        enum: ProjectName,
        default: ProjectName.llss,
    })
    projectName: ProjectName;

    @PrimaryColumn({
        type: 'enum',
        name: 'list_type',
        enum: ListType,
        default: ListType.character,
    })
    listType: ListType;

    @Column({ type: 'json' })
    list: List;
}
