export enum CharaRecordType {
    illust = 'pixiv_illust',
    novel = 'pixiv_novel',
    tagView = 'pixiv_tag_view',
    r18 = 'pixiv_r18',
    fifty = 'pixiv_50',
    hundred = 'pixiv_100',
    fiveHundred = 'pixiv_500',
    thousand = 'pixiv_1000',
    fiveThousand = 'pixiv_5000',
    tenThousand = 'pixiv_10000',
}

export enum SeiyuuRecordType {
    twitterFollower = 'twitter_follower',
    youtube = 'youtube',
    ins = 'ins'
}

export enum CoupleRecordType {
    illust = 'pixiv_illust',
    illustReverse = 'pixiv_illust_reverse',
    illustIntersection = 'pixiv_illust_intersection',
    novel = 'pixiv_novel',
    novelReverse = 'pixiv_novel_reverse',
    novelIntersection = 'pixiv_novel_intersection',
    r18 = 'pixiv_r18',
    r18Reverse = 'pixiv_r18_reverse',
    r18Intersection = 'pixiv_r18_intersection',
}

export type RecordType = CharaRecordType | SeiyuuRecordType | CoupleRecordType;

