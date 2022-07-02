/* eslint-disable no-continue */
/* eslint-disable unicorn/prefer-dom-node-text-content */
/* eslint-disable no-await-in-loop */
import { getPrevWeeklyFetchDate } from '@common/weekly';
import { formatDate } from '@utils/date';
import { chromium, firefox, Locator, Page, Response } from 'playwright';
import * as fs from 'fs';

const DOWNLOAD_PATH = 'public/assets/twitter-article';

/**
 * 解析发推日期，返回 formatDate
 */
function parseArticleDate(date: string) {
    return date.replace(/\D+(\d{4})\D(\d+)\D(\d+)\D+/, (match, p1, p2, p3) => [p1, p2, p3].join('-'));
}

/**
 * 解析发推时间，返回 24 小时制的 小时和分钟
 */
function parseArticleTime(time: string) {
    const plusHour = time.slice(0, 2) === '下午' ? 12 : 0;
    const [hour, min] = time.slice(2).split(':');
    return [+hour + plusHour, +min];
}
/**
 * 解析推特互动数据
 */
function parseInteractData(data: string) {
    // 大于一万会包含万字后缀
    if (data.endsWith('万')) {
        return Number.parseFloat(data.replace('万', '')) * 10_000;
    }
    // 大于一千，会有千分位逗号，小于一千的无影响，直接 parse 即可
    return Number.parseFloat(data.replace(',', ''));
}

/**
 * hover 互动数据获取准确值
 * hover 这一步是有风险的，不一定能成功，有可能导致后续的流程走不了
 */
async function hoverInteractData(
    pageIns: Page,
    dataStr: string,
    dataType: '转推' | '引用推文' | '喜欢次数',

) {
    let count = parseInteractData(dataStr);

    if (count > 10_000) {
        try {
            await pageIns.locator(`text=${dataType}`).hover();
            const layer = await pageIns.locator('#layers>div >> nth=1');
            const layerText = await layer.innerText();
            count = parseInteractData(layerText);
        }
        catch (error) {
            console.log('hover interact error:', error);
        }
    }

    return count;
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
    const page = await context.newPage();
    await page.goto('https://twitter.com/home');
    // 有可能会过期的，每次登录都刷新一下
    await context.storageState({ path: 'state.json' });

    // 获取搜索参数
    // const account = 'lovelive_staff';
    const account = 'Liyu0109';
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

    // 如果是周五以外的时间回溯，那么我需要手动指定 since 和 until
    const since = '2022-01-08';
    const until = '2022-01-15';
    // from:lovelive_staff min_faves:5000 since:2022-06-12 until:2022-06-17
    // const searchTrick = `from:${account} min_faves:${minFaves} since:${since} until:${until}`;
    const searchTrick = `from:${account} min_faves:10000`;

    await page.fill('input[placeholder="搜索 Twitter"]', searchTrick);
    await page.keyboard.press('Enter');
    // 切换到最新 tab，保证时间顺序
    await page.click('text=最新');

    let currentArticle = await page.locator('article >> nth=0');
    await currentArticle.waitFor();
    let articleCount = await currentArticle.count();

    while (articleCount > 0) {
        const innerText = await currentArticle.evaluate((node) => (node as any).innerText);

        const lines = innerText && innerText.split('\n');
        const lastLine = lines.at(-1);
        // 判断最后一行是否是数字开头
        // 如果是主题帖，最后一行会是一段中文，此时互动数据的位置需要相继 - 1
        const isNormalCase = /^\d/.test(lastLine);
        const likeStr = isNormalCase ? lastLine : lines.at(-2);

        // processArticleInteractData
        if (parseInteractData(likeStr) > 7000) {
            // 记录回复数
            const replyStr = isNormalCase ? lines.at(-3) : lines.at(-4);
            const replies = parseInteractData(replyStr);
            console.log('replies:', replies);

            const [detailPage] = await Promise.all([
                context.waitForEvent('page'),
                currentArticle.click({
                    position: { x: 25, y: 100 },
                    modifiers: ['Control'],
                }),
            ]);

            await detailPage.waitForLoadState();

            // 记录 uri
            const uri = detailPage.url().split('/').at(-1);
            const fileNameCommon = `${formatDate(new Date())}@${account}@${uri}`;

            // 记录剩余的互动数据
            const articleDetail = await detailPage.locator('article >> nth=0');
            const detailInnerText = await articleDetail.evaluate((node) => (node as any).innerText);

            const detailLines = detailInnerText && detailInnerText.split('\n');
            const retweets = await hoverInteractData(detailPage, detailLines.at(-6), '转推');
            const withComments = await hoverInteractData(detailPage, detailLines.at(-4), '引用推文');
            const likes = await hoverInteractData(detailPage, detailLines.at(-2), '喜欢次数');
            console.log('retweets:', retweets);
            console.log('withComments:', withComments);
            console.log('likes:', likes);
            // 记录发送时间以及平台等信息
            const [time, date, platform] = detailLines.at(-7).split('·');
            console.log('platform:', platform);
            const [hours, min] = parseArticleTime(time);
            const releaseDate = parseArticleDate(date);
            const releaseDateTime = new Date(releaseDate);
            releaseDateTime.setHours(hours);
            releaseDateTime.setMinutes(min);
            console.log('releaseDateTime:', releaseDateTime);
            console.log('uri:', uri);

            // 删除可能遮挡文章的元素
            await detailPage.locator('section >> nth=0').evaluate((sectionNode) => {
                const { parentNode } = sectionNode;
                const siblingDiv = parentNode?.childNodes[0];
                if (siblingDiv) {
                    parentNode?.removeChild(siblingDiv);
                }
            });
            // 截图
            await articleDetail.screenshot({
                path: `./${DOWNLOAD_PATH}/${account}/${fileNameCommon}.png`,
            });

            // 判断附件类型
            let appendixType: 'img' | 'video' | null = null;
            // 判断 articleDetail 元素内部是否有 photo a 标签
            const photoLinkList = articleDetail.locator('a[href*="photo"]');
            const photoCount = await photoLinkList.count();
            const hasPhoto = photoCount > 0;

            // 如果点赞大于 10000，下载图片
            if (likes > 10_000 && hasPhoto) {
                // 一般只有4张图，点开最后一张会加载全部 4 张原图
                const link = photoLinkList.nth(photoCount - 1);
                const image = await link.locator('img');

                // 点击查看最后一张图片的原图
                await image.click();
                await detailPage.waitForLoadState();
                // 获取全部原图
                const largeImageList = await detailPage.locator('#layers img');

                for (let i = 0; i < photoCount; i++) {
                    const src = await largeImageList.nth(i).getAttribute('src');

                    if (!src) {
                        continue;
                    }

                    const imageId = src.split('?')[0].split('/').at(-1);
                    // node 请求需要设置代理，截图的话图片不够清晰
                    // 获取原图
                    const imagePage = await context.newPage();

                    // TODO: 需要保证打开的页面有 imageId 的图片，否则无法 resolve
                    const waitForImgTask = new Promise((resolve) => {
                        const saveImageFromRes = async (data: Response) => {
                            const url = data.url();
                            if (imageId && url.includes(imageId)) {
                                const body = await data.body();
                                // body 是 buffer，需要先转换成 二进制，然后直接保存为图片即可
                                const binaryData = body.toString('binary');
                                fs.writeFile(
                                    `./${DOWNLOAD_PATH}/${account}/${fileNameCommon}@${photoCount}@${i}.jpg`,
                                    binaryData,
                                    'binary',
                                    (error) => {
                                        if (error) {
                                            console.log(`下载${imageId}失败`);
                                        }
                                        else {
                                            console.log(`下载${imageId}成功`);
                                        }
                                        imagePage.off('response', saveImageFromRes);
                                        resolve(true);
                                    },
                                );
                            }
                        };
                        imagePage.on('response', saveImageFromRes);
                    });
                    await imagePage.goto(src);
                    // 等待图片下载完成
                    await waitForImgTask;
                    await imagePage.close();
                }
            }

            if (hasPhoto) {
                appendixType = 'img';
            }
            else {
                // 判断 articleDetail 元素内部是否有 video 标签
                const videoList = articleDetail.locator('video');
                const videoCount = await videoList.count();
                const hasVideo = videoCount > 0;
                if (hasVideo) {
                    appendixType = 'video';
                }
            }

            console.log('appendixType:', appendixType);
            // post articleInfo

            // post article interact data
            detailPage.close();
        }
        // 更新遍历因子
        // article 元素是动态生成的，只会显示页面中可见的，处理完毕之后删除当前 article
        await currentArticle.evaluate((node) => node.parentNode?.removeChild(node));
        currentArticle = await page.locator('article >> nth=0');
        articleCount = await currentArticle.count();
    }

    console.log('done');

    // await browser.close();

    // Interact with login form
    // await page.click('label');
    // await page.fill('input', 'imperkings@outlook.com');
    // await page.click('text=下一步');
    // await page.fill('input[name="password"]', 'Pang8737K');
    // await page.click('text=登录');
    // await page.waitForTimeout(3000);
    // await context.storageState({ path: 'state.json' });
}
