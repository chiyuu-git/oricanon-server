import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ProjectName, SeiyuuRecordType } from '@chiyu-bit/canon.root';
import { MemberRecordEntity } from 'src/record/common/record.entity';
import { RECORD_DATA_BASE } from 'src/record/common';

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

    @Column({
        type: 'enum',
        name: 'record_type',
        enum: SeiyuuRecordType,
        default: SeiyuuRecordType.twitterFollower,
    })
    recordType: SeiyuuRecordType;

    @Column({ type: 'json', name: 'followers' })
    records: number[];
}

@Entity({ database: RECORD_DATA_BASE, name: 'lls_seiyuu' })
export class LLSSeiyuu extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'lln_seiyuu' })
export class LLNSeiyuu extends MemberRecordEntity {}
@Entity({ database: RECORD_DATA_BASE, name: 'llss_seiyuu' })
export class LLSSSeiyuu extends MemberRecordEntity {}
