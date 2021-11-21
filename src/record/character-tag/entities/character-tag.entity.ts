import { ProjectName, CharacterRecordType } from '@chiyu-bit/canon.root';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
    name: 'character_tag',
})
export class CharacterTag {
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

    @PrimaryColumn({
        type: 'enum',
        name: 'record_type',
        enum: CharacterRecordType,
        default: CharacterRecordType.illust,
    })
    recordType: CharacterRecordType;

    @Column({ type: 'json', name: 'tags' })
    records: number[];
}
