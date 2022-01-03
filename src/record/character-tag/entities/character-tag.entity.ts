import { ProjectName, CharaRecordType } from '@chiyu-bit/canon.root';
import { RECORD_DATA_BASE } from 'src/record/common';
import { MemberRecordEntity } from 'src/record/common/record.entity';
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
        enum: CharaRecordType,
        default: CharaRecordType.illust,
    })
    recordType: CharaRecordType;

    @Column({ type: 'json', name: 'tags' })
    records: number[];
}

@Entity({ database: RECORD_DATA_BASE, name: 'll_chara' })
export class LLChara extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'lls_chara' })
export class LLSChara extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'lln_chara' })
export class LLNChara extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'llss_chara' })
export class LLSSChara extends MemberRecordEntity {}

