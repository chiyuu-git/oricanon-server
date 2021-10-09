import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName } from '../seiyuu-follower.type';

@Entity({
    name: 'seiyuu_follower',
})
export class SeiyuuFollower {
    @PrimaryColumn({
        type: 'date',
    })
    date: string;

    @PrimaryColumn({
        type: 'enum',
        name: 'project_name',
        enum: ProjectName,
        default: ProjectName.llss,
    })
    projectName: ProjectName;

    @Column({ type: 'json', name: 'followers' })
    records: number[];
}
