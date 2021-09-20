import { Column, Entity, PrimaryColumn } from 'typeorm';
import { projectName, list, listType } from '../projects.type';

@Entity()
export class Project {
    @PrimaryColumn({
        type: 'enum',
        name: 'project_name',
        enum: projectName,
        default: projectName.LLSS,
    })
    projectName: projectName;

    @PrimaryColumn({
        type: 'enum',
        name: 'list_type',
        enum: listType,
        default: listType.CHARACTER,
    })
    listType: listType;

    @Column({ type: 'json' })
    list: list;
}
