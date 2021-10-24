export enum ProjectName {
    ll = 'lovelive',
    lls = 'lovelive_sunshine',
    llss = 'lovelive_superstar',
    lln = 'lovelive_nijigasaki_high_school_idol_club',
}

export enum BasicType {
    character = 'character',
    seiyuu = 'seiyuu',
    couple = 'couple',
}

export enum CharacterRecordType {
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
    r18 = 'pixiv_r18'
}

export enum SeiyuuRecordType {
    twitter = 'twitter',
    youtube = 'youtube',
    ins = 'ins'
}

// export type RecordType = CharacterRecordType | SeiyuuRecordType
// TODO: 不同的 basicType 对应的 recordType 理论上来说是不同，是否有办法通过泛型区分？
export enum RecordType {
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
    twitter = 'twitter',
    youtube = 'youtube',
    ins = 'ins'
}

