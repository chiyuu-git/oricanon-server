import { Column, Entity } from 'typeorm';
import { Member } from './member.entity';

@Entity({
    database: 'canon_member',
    name: 'chara_info',
})
export class CharaInfo extends Member {
    @Column({
        type: 'varchar',
        name: 'pixiv_tag',
    })
    pixivTag;

    @Column({
        type: 'varchar',
        name: 'official_order',
    })
    officialOrder;
}

