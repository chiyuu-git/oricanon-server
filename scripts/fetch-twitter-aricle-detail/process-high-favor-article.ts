/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
import { Locator, Response, BrowserContext } from 'playwright';
import * as fs from 'fs';
import { formatDate } from '@utils/date';
import { createArticle, createArticleInteractData } from '../common/fetch';
import { DOWNLOAD_PATH, getFileName } from '../common/file';

interface TweetDetailResult {
    /**
     * userInfo
     */
    core: Record<string, unknown>;
    /**
     * articleInfo
     */
    legacy: ArticleInfo;
}

interface ArticleInfo {
    created_at: string;
    entities: {
        /**
         * 附件的静态信息，即使是 video 类型的附件，这里也只会保存 poster photo
         */
        media: { type: 'photo'; }[];
        hashtags: Record<string, unknown>[];
    };
    extended_entities?: {
        /**
         * appendixInfo
         */
        media: { type: 'photo' | 'video'; }[];
    };
    reply_count: number;
    retweet_count: number;
    retweeted: boolean;
    quote_count: number;
    favorite_count: number;
    favorited: boolean;
    full_text: string;
    /**
     * platformInfo
     */
    source: `<a>${string}</a>`;
    /**
     * tweet id
     */
    id_str: string;
}

interface ProcessHighFavorArticle {
    context: BrowserContext;
    currentArticle: Locator;
    account: string;
}

/**
 * 处理高赞文章，创建article、articleInteractData
 * 不用关心文章截图的逻辑，文章截图和互动数据分析是两个并行的任务
 * 截图一定会成功，但是互动分析取决于 response，有可能会失败
 */
export async function processHighFavorArticle({
    context,
    currentArticle,
    account,
}: ProcessHighFavorArticle) {
    const articleInfoList: ArticleInfo[] = [];
    // 监听 tweetDetail 响应
    const waitForTweetDetail = new Promise((resolve) => {
        const responseListener = async (response: Response) => {
            if (response.url().includes('/TweetDetail?') && response.status() === 200) {
                try {
                    const { entries } = JSON
                        .parse(((await response.body()).toString('utf-8') as any))
                        .data.threaded_conversation_with_injections_v2.instructions[0];

                    for (const iterator of entries) {
                        const tweetResult = iterator.content.itemContent?.tweet_results;

                        if (tweetResult) {
                            const { result } = tweetResult;
                            articleInfoList.push(result?.legacy);
                        }
                    }
                }
                catch (error) {
                    console.log('error:', error);
                }
                context.off('response', responseListener);
                resolve(true);
            }
        };
        context.on('response', responseListener);
    });
    const [detailPage] = await Promise.all([
        context.waitForEvent('page'),
        currentArticle.click({
            position: { x: 25, y: 75 },
            modifiers: ['Control'],
        }),
    ]);
    await Promise.all([
        waitForTweetDetail,
        detailPage.waitForTimeout(10_000),
    ]);

    const url = detailPage.url();
    // 记录 uri
    const uri = url.split('/').at(-1) as string;

    // 主题帖中，targetArticle 有可能是第二篇文章，需要遍历所有 articleInfo 进行确认
    // 例如：https://twitter.com/Liyu0109/status/1533486639217246209
    let articleInfo: ArticleInfo | null = null;
    let targetArticleIndex = 0;
    const articleCount = articleInfoList.length;
    for (let i = 0; i < articleCount; i++) {
        const result = articleInfoList[i];
        const { id_str } = result;
        if (id_str === uri) {
            articleInfo = result;
            targetArticleIndex = i;
            break;
        }
    }

    // TODO:出错的页面记录下 url，在一个单独的方法尝试重新获取
    if (!articleInfo) {
        await detailPage.close();
        return {
            isFetchTweetDetailSuccess: false,
            url,
        };
    }

    // 记录互动数据
    const {
        created_at,
        extended_entities,
        reply_count,
        retweet_count,
        quote_count,
        favorite_count,
        source,
    } = articleInfo as unknown as ArticleInfo;
    const createdAt = new Date(created_at);
    const fileNameCommon = getFileName(account, createdAt, uri);
    const platformRegex = />([^<]*)</;
    const platformType = (platformRegex.exec(source) as RegExpExecArray)[1];
    const appendixType = extended_entities ? extended_entities.media[0].type : null;

    // post articleInfo
    const createArticleResult = await createArticle({
        account,
        uri,
        createdAt,
        platformType,
        appendixType,
    });
    // post article interact data
    const createArticleInteractDataResult = await createArticleInteractData({
        uri,
        replyCount: reply_count,
        retweetCount: retweet_count,
        quoteCount: quote_count,
        favoriteCount: favorite_count,
        recordDate: formatDate(new Date()),
    });

    // 如果点赞大于 7000，下载图片 TODO: 抽离函数
    if (appendixType === 'photo') {
        // 找准 targetArticle
        const articleEl = await detailPage.locator(`article >> nth=${targetArticleIndex}`);
        // 如果有附件的话会影响 imgList，只获取属于当前 article 的图片
        const photoLinkList = await articleEl.locator(`a[href*="${uri}/photo"]`);
        const photoCount = await photoLinkList.count();
        // 一般只有4张图，点开最后一张会加载全部 4 张原图
        const link = photoLinkList.nth(photoCount - 1);
        const image = await link.locator('img');

        // 点击查看最后一张图片的原图
        await image.click();
        await detailPage.waitForLoadState();
        // 获取全部原图，从 json 上只能看到一张图片 但是 large 的图确实是高清一点，应该是twitter专门做了优化的
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
            const path = `./${DOWNLOAD_PATH}/${account}/${fileNameCommon}@${photoCount}@${i}.jpg`;

            // TODO: 需要保证打开的页面有 imageId 的图片，否则无法 resolve
            const waitForImgTask = new Promise((resolve) => {
                // 检查文件是否存在于当前目录中。
                fs.access(path, fs.constants.F_OK, (err) => {
                    if (err) {
                        const saveImageFromRes = async (data: Response) => {
                            if (imageId && data.url().includes(imageId)) {
                                const body = await data.body();
                                // body 是 buffer，需要先转换成 二进制，然后直接保存为图片即可
                                const binaryData = body.toString('binary');
                                fs.writeFile(
                                    path,
                                    binaryData,
                                    'binary',
                                    (error) => {
                                        if (error) {
                                            console.log(`${imageId} 下载失败`);
                                        }
                                        else {
                                            console.log(`${imageId} 下载成功`);
                                        }
                                        imagePage.off('response', saveImageFromRes);
                                        resolve(true);
                                    },
                                );
                            }
                        };
                        imagePage.on('response', saveImageFromRes);
                    }
                    else {
                        console.log(`${imageId} 已存在`);
                        resolve(true);
                    }
                });
            });
            await imagePage.goto(src);
            // 等待图片下载完成
            await waitForImgTask;
            await imagePage.close();
        }
    }

    await detailPage.close();

    return {
        isFetchTweetDetailSuccess: true,
        url,
        createdAt,
    };
}
