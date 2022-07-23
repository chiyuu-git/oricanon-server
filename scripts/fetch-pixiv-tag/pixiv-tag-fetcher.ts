/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import { CharaRecordType, CoupleRecordType, RecordType } from '@common/record';
import { Category, ProjectName } from '@common/root';
import { BrowserFetcher } from '../common/browser-fetch';
import { getProjectMembersOfCategory, PostProjectRecord, postProjectRecord } from '../common/fetch';

interface FetchPixivTagCount {
    tagList: string[];
    searchMode?: 's_tag_full' | 's_tag';
}

type HandleTagList = Omit<PostProjectRecord, 'records' | 'recordType'> & {
    illustRecordType: RecordType;
    novelRecordType: RecordType;
    tagList: string[];
}

export const PIXIV_AJAX_SEARCH = 'https://www.pixiv.net/ajax/search';

/**
 * search_type有两种情况, artworks | novels
 * artworks 获取的是插画及漫画，不包括小说
 */
const s_type = 'artworks';

const RANGE_START = '2020-01-01';
const RANGE_END = '2020-12-13';
const range = `&scd=${RANGE_START}&ecd=${RANGE_END}`;

/**
   * @param model 可以为r18
   * @param type 统一为全部，包括插画、漫画、动图
   * @param lang 语言参数影响返回值
   */
const others = '&order=date_d&mode=all&p=1&type=all&lang=ja';

/**
  * encode 字段 获取users入り时需要修改
  *
  * @param users入り 50 | 100 | 500 | 1000 | 5000 | 10000
  */
// const encode = encodeURI(members[i] + ' 10000users入り');

export class PixivTagFetcher extends BrowserFetcher {
    private async fetchPixivTagCount({
        tagList,
        searchMode = 's_tag_full',
    }: FetchPixivTagCount) {
        const illusts = [];
        const novels = [];
        try {
            for (const tag of tagList) {
                const encode = encodeURI(tag);
                // top url 可以同时 fetch illust 和 novel，默认为 full_tag
                // const url = 'https://www.pixiv.net/ajax/search/top/%E9%AB%98%E5%9D%82%E7%A9%82%E4%B9%83%E6%9E%9C?lang=ja';
                const url = `${PIXIV_AJAX_SEARCH}/top/${encode}?lang=ja`;
                // const url = `${PIXIV_HOME_PAGE}/artworks/${encode}?word=${encode}&s_mode=${searchMode}${others}`;
                // rangeUrl，其余与普通url一致
                // const url = `${PIXIV_HOME_PAGE}/artworks/${encode}?word=${encode}&s_mode=${searchMode}${range}${others}`;
                // r18;
                // const url = `${pixivHomePage}/artworks/${encode}?word=${encode}&order=date_d&mode=r18&p=1&s_mode=s_tag_full&type=all&lang=ja`;
                // novel
                // const url = `${PIXIV_HOME_PAGE}/novels/${encode}?word=${encode}&s_mode=${searchMode}${range}${others}`;
                console.log(`fetch ${tag}: ${url}`);
                const data = await this.browserFetch(url);
                if (data.ok()) {
                    const result = await data.json();
                    // pixiv 默认也会返回 0，还是别保险了，报错发现问题
                    illusts.push(result.body.illustManga?.total);
                    novels.push(result.body.novel?.total);
                    // tags.push(result.body.novel.total)
                }
                else {
                    illusts.push(0);
                    novels.push(0);
                }

                // 全量时慢慢抓
                const delay = this.onlyActive ? 0 : 10_000;
                const waitFor = new Promise((resolve) => setTimeout(() => resolve(true), delay));
                await waitFor;
            }
        }
        catch (error) {
            console.log(error);
        }
        return { illusts, novels };
    }

    private async handleTagList({
        route,
        projectName,
        illustRecordType,
        novelRecordType,
        tagList,
        onlyActive,
    }: HandleTagList) {
        if (tagList.length === 0) {
            return;
        }
        const { illusts, novels } = await this.fetchPixivTagCount({ tagList });
        console.log(projectName, illustRecordType, illusts);
        console.log(projectName, novelRecordType, novels);
        postProjectRecord({
            projectName,
            recordType: illustRecordType,
            records: illusts,
            route,
            onlyActive,
        });
        postProjectRecord({
            projectName,
            recordType: novelRecordType,
            records: novels,
            route,
            onlyActive,
        });
    }

    async getPixivCharaTagCount() {
        console.log('==== fetch chara start');
        const route = 'chara_tag/create_project_record';
        const { onlyActive } = this;

        for (const projectName of Object.values(ProjectName)) {
            const charaInfoList = await getProjectMembersOfCategory<Category.chara>({
                category: Category.chara,
                projectName,
                onlyActive,
            });
            const charaTagList = charaInfoList.map(({ pixivTag }) => pixivTag);
            console.log(projectName, 'charaTagLists:', charaTagList);

            await this.handleTagList({
                route,
                projectName,
                illustRecordType: CharaRecordType.illust,
                novelRecordType: CharaRecordType.novel,
                onlyActive,
                tagList: charaTagList,
            });
        }

        console.log('==== fetch chara end');
    }

    async getPixivCoupleTagCount() {
        console.log('==== fetch couple start');
        const route = 'couple_tag/create_project_record';
        const { onlyActive } = this;

        for (const projectName of Object.values(ProjectName)) {
            const coupleInfoList = await getProjectMembersOfCategory<Category.couple>({
                category: Category.couple,
                projectName,
                onlyActive,
            });
            const coupleTagList = coupleInfoList.map(({ pixivTag }) => pixivTag);
            console.log(projectName, 'coupleTagList:', coupleTagList);

            await this.handleTagList({
                route,
                projectName,
                illustRecordType: CoupleRecordType.illust,
                novelRecordType: CoupleRecordType.novel,
                onlyActive,
                tagList: coupleTagList,
            });

            const coupleReverseTagList = coupleInfoList.map(({ pixivReverseTag }) => pixivReverseTag);
            console.log(projectName, 'coupleReverseTagList:', coupleReverseTagList);

            await this.handleTagList({
                route,
                projectName,
                illustRecordType: CoupleRecordType.illustReverse,
                novelRecordType: CoupleRecordType.novelReverse,
                onlyActive,
                tagList: coupleReverseTagList,
            });

            // 只有 active 的成员才计算 intersection
            if (onlyActive) {
                const coupleIntersectionTagList = coupleInfoList.map(({
                    pixivTag,
                    pixivReverseTag,
                }) => `${pixivTag} ${pixivReverseTag}`);
                console.log(projectName, 'coupleIntersectionTagList:', coupleIntersectionTagList);

                await this.handleTagList({
                    route,
                    projectName,
                    illustRecordType: CoupleRecordType.illustIntersection,
                    novelRecordType: CoupleRecordType.novelIntersection,
                    onlyActive,
                    tagList: coupleIntersectionTagList,
                });
            }
        }

        console.log('==== fetch couple end');
    }
}
