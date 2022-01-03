import { Column, Entity, PrimaryColumn } from 'typeorm';
import { MemberInfo } from './member-info.entity';

@Entity({
    database: 'canon_member',
    name: 'chara_info',
})
export class CharaInfo extends MemberInfo {
    @PrimaryColumn({
        type: 'int',
        name: 'member_id',
    })
    memberId;

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

