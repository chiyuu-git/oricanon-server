import { Column, Entity, PrimaryColumn } from 'typeorm';
import { MemberInfo } from './member-info.entity';

@Entity({
    database: 'canon_member',
    name: 'couple_info',
})
export class CoupleInfo extends MemberInfo {
    @PrimaryColumn({
        type: 'int',
        name: 'couple_id',
    })
    declare memberId: number;

    @Column({
        type: 'varchar',
        name: 'pixiv_tag',
    })
    pixivTag: string;

    @Column({
        type: 'varchar',
        name: 'pixiv_reverse_tag',
    })
    pixivReverseTag: string;
}
