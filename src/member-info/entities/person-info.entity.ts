import { Column, Entity, PrimaryColumn } from 'typeorm';
import { MemberInfo } from './member-info.entity';

@Entity({
    database: 'canon_member',
    name: 'person_info',
})
export class PersonInfo extends MemberInfo {
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
}
