import { Column, Entity } from 'typeorm';
import { Member } from './member.entity';

@Entity({
    database: 'canon_member',
    name: 'chara_couple_info',
})
export class CoupleInfo extends Member {
    @Column({
        type: 'varchar',
        name: 'pixiv_tag',
    })
    pixivTag;

    @Column({
        type: 'varchar',
        name: 'pixiv_reverse_tag',
    })
    pixivReverseTag;
}
