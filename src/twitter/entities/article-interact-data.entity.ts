import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
    database: 'canon_twitter',
    name: 'article_interact_data',
})
export class ArticleInteractData {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'record_id',
    })
    recordId: number;

    @Column({
        type: 'int',
        name: 'article_id',
    })
    articleId: number;

    @Column({
        type: 'int',
        name: 'reply_count',
    })
    replyCount: number;

    /**
     * 引用推文，是转推的一种，其实就是转推的时候加上评论
     * 在推文外部看到的转推其实是 retweets + with_comments 的总数
     */
    @Column({
        type: 'int',
        name: 'retweet_count',
    })
    retweetCount: number;

    @Column({
        type: 'int',
        name: 'quote_count',
    })
    quoteCount: number;

    @Column({
        type: 'int',
        name: 'favorite_count',
    })
    favoriteCount: number;

    @Column({
        type: 'date',
        name: 'record_date',
    })
    recordDate: string;
}
