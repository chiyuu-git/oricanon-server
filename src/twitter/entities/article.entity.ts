import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    database: 'canon_twitter',
    name: 'article',
})
export class Article {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'article_id',
    })
    articleId: number;

    /**
     * join 推特帐号表，因为有企划帐号，所以不能直接 join 声优表
     */
    @Column({
        type: 'int',
        name: 'account_id',
    })
    accountId: number;

    /**
     * 只记录最后的数字，完整的url拼接即可
     */
    @Column({
        type: 'varchar',
        name: 'uri',
    })
    uri: string;

    @Column({
        type: 'datetime',
        name: 'created_at',
    })
    createdAt: Date;

    /**
     * 发布推文的时候使用的平台，比如 iOS、pc
     */
    @Column({
        type: 'int',
        name: 'platform_type_id',
    })
    platformTypeId: number;

    /**
     * 附件的类型，比如 video、photo、无附件
     *
     * 图片地址：https://twitter.com/LoveLive_staff/status/1532701754613469184/photo/1
     */
    @Column({
        type: 'int',
        name: 'appendix_type_id',
        nullable: true,
    })
    appendixTypeId: number | null;

    /**
     * 与推文直接关联的 event
     */
    @Column({
        type: 'int',
        name: 'event_id',
        nullable: true,
    })
    eventId: number | null;
}
