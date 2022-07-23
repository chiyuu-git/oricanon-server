/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { getProjectMembersOfCategory, PostProjectRecord, postProjectRecord } from 'scripts/common/fetch';
import { Category, ProjectName } from '@common/root';
import { CharaRecordType, CoupleRecordType, RecordType } from '@common/record';
import { BrowserFetcher } from '../common/browser-fetch';

type HandleTagList = Omit<PostProjectRecord, 'records' | 'recordType'> & {
    recordType: RecordType;
    tagList: string[];
}

const PIXIV_DIC_HOME_PAGE = 'https://dic.pixiv.net';

export class PixivTagViewFetcher extends BrowserFetcher {
    private async fetchPixivTotalViewCount(tagList: string[]) {
        const totalViewCountList = [];
        try {
            for (const tag of tagList) {
                const encode = encodeURI(tag);

                // dic url 返回的是html文件
                const url = `${PIXIV_DIC_HOME_PAGE}/a/${encode}`;
                console.log(`${tag} fetch start：${PIXIV_DIC_HOME_PAGE}/a/${tag}`);
                const data = await this.browserFetch(url);
                if (data.ok()) {
                    // 当百科没有对应的词条的时候会返回一个提示的html
                    const html = await data.text();
                    // 正则匹配 总阅览数
                    const viewRegex = /総閲覧数: (\d+)/;
                    const res = viewRegex.exec(html);
                    if (res) {
                        const [match, p1] = res;
                        totalViewCountList.push(+p1);
                    }
                }
                else {
                    totalViewCountList.push(0);
                }

                // 全量时慢慢抓
                const delay = this.onlyActive ? 3000 : 10_000;
                const waitFor = new Promise((resolve) => setTimeout(() => resolve(true), delay));
                await waitFor;
            }
        }
        catch (error) {
            console.log(error);
        }
        return totalViewCountList;
    }

    private async handleTagList({
        route,
        projectName,
        recordType,
        tagList,
        onlyActive,
    }: HandleTagList) {
        if (tagList.length === 0) {
            return;
        }
        const viewCountList = await this.fetchPixivTotalViewCount(tagList);
        console.log(projectName, recordType, viewCountList);
        postProjectRecord({
            projectName,
            recordType,
            records: viewCountList,
            route,
            onlyActive,
        });
    }

    async getCharaTagViewCount() {
        console.log('==== fetch chara tag view start');
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

            if (charaTagList.length === 0) {
                continue;
            }
            this.handleTagList({
                route,
                projectName,
                recordType: CoupleRecordType.tagView,
                tagList: charaTagList,
                onlyActive,
            });

            await new Promise((resolve) => setTimeout(() => resolve(true), 3000));
        }

        console.log('==== fetch chara tag view end');
    }

    async getCoupleTagViewCount() {
        console.log('==== fetch couple tag view start');
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
                recordType: CoupleRecordType.tagView,
                tagList: coupleTagList,
                onlyActive,
            });

            const coupleReverseTagList = coupleInfoList.map(({ pixivReverseTag }) => pixivReverseTag);
            console.log(projectName, 'coupleReverseTagList:', coupleReverseTagList);

            await this.handleTagList({
                route,
                projectName,
                recordType: CoupleRecordType.tagViewReverse,
                tagList: coupleReverseTagList,
                onlyActive,
            });
        }

        console.log('==== fetch couple view end');
    }
}
