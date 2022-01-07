import { Column, Entity, PrimaryColumn } from 'typeorm';
import { MemberInfo } from './member-info.entity';

@Entity({
    database: 'canon_member',
    name: 'seiyuu_info',
})
export class SeiyuuInfo extends MemberInfo {
    @PrimaryColumn({
        type: 'int',
        name: 'member_id',
    })
    declare memberId: number;

    @Column({
        type: 'varchar',
        name: 'twitter_account',
    })
    twitterAccount: string;

    @Column({
        type: 'varchar',
        name: 'official_order',
    })
    officialOrder: number;
}
