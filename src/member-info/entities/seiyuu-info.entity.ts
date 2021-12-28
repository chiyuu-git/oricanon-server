import { Column, Entity } from 'typeorm';
import { Member } from './member.entity';

@Entity({
    database: 'canon_member',
    name: 'seiyuu_info',
})
export class SeiyuuInfo extends Member {
    @Column({
        type: 'varchar',
        name: 'twitter_account',
    })
    twitterAccount;

    @Column({
        type: 'varchar',
        name: 'official_order',
    })
    officialOrder;
}
