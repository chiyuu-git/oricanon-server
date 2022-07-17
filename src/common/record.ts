export enum CharaRecordType {
    illust = 'pixiv_illust',
    novel = 'pixiv_novel',
    tagView = 'pixiv_tag_view',
    r18 = 'pixiv_r18',
    fifty = 'pixiv_favor_50',
    hundred = 'pixiv_favor_100',
    fiveHundred = 'pixiv_favor_500',
    thousand = 'pixiv_favor_1000',
    fiveThousand = 'pixiv_favor_5000',
    tenThousand = 'pixiv_favor_10000',
    favorSum = 'pixiv_favor_sum',
    illustWithNovel = 'pixiv_illust_with_novel',
}

export const FavorRecordTypeList = [
    CharaRecordType.fifty,
    CharaRecordType.hundred,
    CharaRecordType.fiveHundred,
    CharaRecordType.thousand,
    CharaRecordType.fiveThousand,
    CharaRecordType.tenThousand,
] as const;

export enum PersonRecordType {
    twitterFollower = 'twitter_follower',
    youtube = 'youtube',
    ins = 'ins'
}

export enum CoupleRecordType {
    illust = 'pixiv_illust',
    illustReverse = 'pixiv_illust_reverse',
    illustIntersection = 'pixiv_illust_intersection',
    tagView = 'pixiv_tag_view',
    tagViewReverse = 'pixiv_tag_view_reverse',
    novel = 'pixiv_novel',
    novelReverse = 'pixiv_novel_reverse',
    novelIntersection = 'pixiv_novel_intersection',
    r18 = 'pixiv_r18',
    r18Reverse = 'pixiv_r18_reverse',
    r18Intersection = 'pixiv_r18_intersection',
    illustWithNovel = 'pixiv_illust_with_novel',
    coupleUnionIllust = 'pixiv_couple_union_illust',
    coupleUnionNovel = 'pixiv_couple_union_novel'
}

export type RecordType = CharaRecordType | CoupleRecordType| PersonRecordType;

export interface ProjectRecord {
    date: string;
    records: number[];
    average: number;
    median: number;
}

export interface MemberRecord {
    date: string;
    record: number;
}
