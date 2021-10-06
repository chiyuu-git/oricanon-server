/**
 * @file CouplePixivTagsModule 下的公共类型
 */

import { ProjectName } from '../canon.type';

export { ProjectName } from '../canon.type';

/**
  * SeiyuuFollowerType 预留类型字段，目前仅有 twitter一 种类型
  */
export enum SeiyuuFollowerType {
    default = 'twitter',
    youtube = 'youtube',
    ins = 'ins'
}

