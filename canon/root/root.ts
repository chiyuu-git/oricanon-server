export type DateString = string;

export enum ProjectName {
    ll = 'lovelive',
    lls = 'lovelive_sunshine',
    lln = 'lovelive_nijigasaki_high_school_idol_club',
    llss = 'lovelive_superstar',
}

export enum BasicType {
    chara = 'chara',
    seiyuu = 'seiyuu',
    couple = 'couple',
}

export enum CharaRecordType {
    illust = 'pixiv_illust',
    illustReverse = 'pixiv_illust_reverse',
    illustIntersection = 'pixiv_illust_intersection',
    novel = 'pixiv_novel',
    novelReverse = 'pixiv_novel_reverse',
    novelIntersection = 'pixiv_novel_intersection',
    hundred = 'pixiv_100',
    thousand = 'pixiv_1000',
    tenThousand = 'pixiv_10000',
    fifty = 'pixiv_50',
    fiveHundred = 'pixiv_500',
    fiveThousand = 'pixiv_5000',
    r18 = 'pixiv_r18',
    tagView = 'pixiv_tag_view'
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

export enum SeiyuuRecordType {
    twitterFollower = 'twitter_follower',
    youtube = 'youtube',
    ins = 'ins'
}

// export type RecordType = CharaRecordType | SeiyuuRecordType
// TODO: 不同的 basicType 对应的 recordType 理论上来说是不同，是否有办法通过泛型区分？
export type RecordType = CharaRecordType | CoupleRecordType | SeiyuuRecordType;

/**
 * AggregationRecordType
 */
export enum AggregationType {
    // couple 的默认是 union 之后相加，不想专门新增一个类型了
    illustWithNovel = 'pixiv_illust_with_novel',
    coupleUnionIllust = 'pixiv_couple_union_illust',
    coupleUnionNovel = 'pixiv_couple_union_novel'
}

export type InfoType = RecordType | AggregationType;

export function isRecordType(infoType: InfoType): infoType is RecordType {
    return Object.values(CharaRecordType).includes(infoType as CharaRecordType)
        || Object.values(SeiyuuRecordType).includes(infoType as SeiyuuRecordType);
}

export interface Record {
    date: DateString;
    records: number[];
}
