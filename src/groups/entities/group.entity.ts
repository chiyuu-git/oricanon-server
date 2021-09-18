import { Column, Entity, PrimaryColumn } from 'typeorm';
import { groupName } from '../groups.type';

@Entity()
export class Group {
    @PrimaryColumn({
        type: 'enum',
        name: 'group_name',
        enum: groupName,
        default: groupName.liella,
    })
    groupName: groupName;

    @Column({
        type: 'json',
    })
    members: string[];
}
