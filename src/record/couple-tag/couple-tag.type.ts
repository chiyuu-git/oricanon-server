/**
 * @file CoupleTagsModule 下的公共类型
 */

import { ProjectName } from '../../canon.type';

export { ProjectName } from '../../canon.type';

/**
 * CoupleTagType
 */
export enum CoupleTagType {
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
