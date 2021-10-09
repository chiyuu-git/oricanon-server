import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName, CharacterTagType } from '../character-tag.type';

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
        enum: CharacterTagType,
        default: CharacterTagType.default,
    })
    type: CharacterTagType;

    @Column({ type: 'json', name: 'tags' })
    records: number[];
}
