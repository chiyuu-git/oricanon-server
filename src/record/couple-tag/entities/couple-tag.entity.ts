import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName, CharacterRecordType } from '@chiyu-bit/canon.root';
import { CoupleRecordEntity } from 'src/record/common/record.entity';
import { RECORD_DATA_BASE } from 'src/record/common';

@Entity({
    name: 'couple_tag',
})
export class CoupleTag {
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

@Entity({ database: RECORD_DATA_BASE, name: 'llss_couple' })
export class LLSSCouple extends CoupleRecordEntity {}
