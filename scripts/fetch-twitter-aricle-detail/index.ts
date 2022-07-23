/* eslint-disable camelcase */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable unicorn/prefer-dom-node-text-content */
import { Category, ProjectName } from '@common/root';
import { getPrevWeeklyFetchDate } from '@common/weekly';
import { formatDate } from '@utils/date';
import { BrowserContext, chromium } from 'playwright';
import { getLiellaTwitterAccountList, getProjectMembersOfCategory } from 'scripts/common/fetch';
import { DOWNLOAD_PATH, getTwitterPhotoFileName } from '../common/file';
import { processHighFavorArticle } from './process-high-favor-article';

interface TwitterAricleSearchOptions {
    account: string;
    minFaves: number;
    since: string;
    until: string;
    saveFaves: number;
}

/**
 * 解析推特互动数据文本
 */
function parseInteractData(data: string) {
    // 大于一万会包含万字后缀
    if (data.endsWith('万')) {
        return Number.parseFloat(data.replace('万', '')) * 10_000;
    }
    // 大于一千，会有千分位逗号，小于一千的无影响，直接 parse 即可
    return Number.parseFloat(data.replace(',', ''));
}

async function getTwitterArticleOfAccount(context: BrowserContext, searchOptions: TwitterAricleSearchOptions) {
    const page = await context.newPage();
    await page.goto('https://twitter.com/home');
    // 有可能会过期的，每次登录都刷新一下
    await context.storageState({ path: 'state.json' });

    const { account, minFaves, since, until, saveFaves } = searchOptions;
    // from:lovelive_staff min_faves:5000 since:2022-06-12 until:2022-06-17
    const searchTrick = `from:${account} min_faves:${minFaves} since:${since} until:${until}`;
    console.log('searchTrick:', searchTrick);
    // const searchTrick = `from:${account} min_faves:10000`;

    await page.fill('input[placeholder="搜索 Twitter"]', searchTrick);
    await page.keyboard.press('Enter');
    // 切换到最新 tab，保证时间顺序
    // const sectionEL = await page.locator('section');
    await page.click('text=最新');
    // await page.waitForLoadState();
    // 删除可能遮挡文章的元素
    await page.locator('div[aria-label="主页时间线"]').evaluate((node) => {
        const siblingDiv = node?.childNodes[0];
        if (siblingDiv) {
            node?.removeChild(siblingDiv);
        }
    });

    let currentArticle = await page.locator('article >> nth=0');
    try {
        await currentArticle.waitFor();
    }
    catch (error) {
        console.log('error:', error);
        return;
    }
    let articleCount = await currentArticle.count();

    const fetchFailedList: string[] = [];

    while (articleCount > 0) {
        const innerText = await currentArticle.evaluate((node) => (node as any).innerText);

        const lines = innerText && innerText.split('\n');
        const lastLine = lines.at(-1);
        // 判断最后一行是否是数字开头
        // 如果是主题帖，最后一行会是一段中文，此时互动数据的位置需要相继 - 1
        const isNormalCase = /^\d/.test(lastLine);
        const faveStr = isNormalCase ? lastLine : lines.at(-2);

        if (parseInteractData(faveStr) > saveFaves) {
            const { isFetchTweetDetailSuccess, url, createdAt } = await processHighFavorArticle({
                context,
                currentArticle,
                account,
            });
            if (!isFetchTweetDetailSuccess) {
                fetchFailedList.push(url);
            }
            // 截图
            if (createdAt) {
                const fileNameCommon = getTwitterPhotoFileName(account, createdAt, url.split('/').at(-1) as string);
                await currentArticle.screenshot({
                    path: `./${DOWNLOAD_PATH}/${account}/${fileNameCommon}.png`,
                });
            }
        }

        // 更新遍历因子
        // article 元素是动态生成的，只会显示页面中可见的，处理完毕之后删除当前 article
        await currentArticle.evaluate((node) => node.parentNode?.removeChild(node));
        currentArticle = await page.locator('article >> nth=0');
        articleCount = await currentArticle.count();
        await page.waitForTimeout(500);
    }

    console.log('fetchFailedList:', account, fetchFailedList);
}

// https://playwright.dev/docs/api/class-page#page-fill
export async function fetchTwitterArticleDetail() {
    const browser = await chromium.launch({
        // 'chrome' or 'msedge', 'chrome-beta', 'msedge-beta', 'msedge-dev', etc.
        channel: 'msedge',
        headless: false,
        slowMo: 300,
    });
    const context = await browser.newContext({ storageState: 'state.json' });

    // "twitterAccounts": [
    //     "SayuriDate",
    //     "Liyu0109",
    //     "MisakiNako_",
    //     "_Naomi_Payton_",
    //     "AoyamaNagisa",
    //     "NozomiSuzuhara",
    //     "a_yabushima",
    //     "AyaEmori_BOX"
    //   ]
    // const account = 'lovelive_staff';
    // 获取搜索参数
    // const account = 'AyaEmori_BOX';
    // 查询的标准是 1000，可以保证看到所有有意义的推特
    // 记录的标准是 7000，低于 7000 的直接删掉就好。
    const minFaves = 1000;
    // 可以默认日期后跟着的时间是 00:00，即 since 值是包括当天的，可以获取到当天的推文，until 值是不包括
    // 如果是周五准时回溯，那么 PWFD + 1 是 until 值， PWFD - 6 是 since 值
    // const fetchDate = getPrevWeeklyFetchDate(formatDate(new Date()));
    // const untilDate = new Date(fetchDate);
    // untilDate.setDate(untilDate.getDate() + 1);
    // const sinceDate = new Date(fetchDate);
    // sinceDate.setDate(sinceDate.getDate() - 6);
    // const until = formatDate(untilDate);
    // const since = formatDate(sinceDate);

    // 如果是周五以外的时间回溯，那么我需要手动指定 since 和 since + 7
    // 动画之前的 6000 就要保存了，再早的 5000 就要保存
    const since = '2022-07-09';
    const until = '2022-07-16';
    // await getTwitterArticleOfAccount(context, {
    //     account,
    //     minFaves,
    //     since,
    //     until,
    //     saveFaves: 6000,
    // });
    const personInfoList = await getProjectMembersOfCategory<Category.person>({
        category: Category.person,
        projectName: ProjectName.llss,
    });
    const twitterAccountList = personInfoList.map(({ twitterAccount }) => twitterAccount);
    console.log('liellaTwitterAccountList:', twitterAccountList);
    for (const [index, account] of Object.entries(twitterAccountList)) {
        const saveFaves = +index <= 4 ? 7000 : 6000;
        await getTwitterArticleOfAccount(context, {
            account,
            minFaves,
            since,
            until,
            saveFaves,
        });
    }

    console.log('done');

    // await browser.close();
}

