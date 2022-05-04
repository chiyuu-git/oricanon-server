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
    declare memberId: number;

    @Column({
        type: 'varchar',
        name: 'pixiv_tag',
    })
    pixivTag: string;

    @Column({
        type: 'varchar',
        name: 'birthday',
    })
    birthday: string;

    @Column({
        type: 'tinyint',
        name: 'record_order',
    })
    recordOrder: number;
}

