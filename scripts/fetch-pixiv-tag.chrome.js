/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
/**
 * @file 用于在chrome控制台获取 pixivTags
 */

/**
 * search_type有两种情况, artworks | novels
 * artworks 获取的是插画及漫画，不包括小说
 */
const s_type = 'artworks';

const RANGE_START = '2021-04-03';
const RANGE_END = '2021-04-09';
const range = `&scd=${RANGE_START}&ecd=${RANGE_END}`;

/**
  * @param model 可以为r18
  * @param type 统一为全部，包括插画、漫画、动图
  * @param lang 语言参数不影响返回值
  */
const others = '&order=date_d&mode=all&p=1&type=all&lang=ja';

/**
 * encode 字段 获取users入り时需要修改
 *
 * @param users入り 50 | 100 | 500 | 1000 | 5000 | 10000
 */
// const encode = encodeURI(members[i] + ' 10000users入り');
const PIXIV_HOME_PAGE = 'https://www.pixiv.net/ajax/search';
const HOST = 'http://localhost:3000';

async function fetchPixivTagCount({
    pixivTags,
    // search_mode有两种情况, s_tag_full | s_tag
    searchMode = 's_tag_full',
}) {
    const illusts = [];
    const novels = [];
    try {
        for (const pixivTag of pixivTags) {
            const encode = encodeURI(pixivTag);

            // top url 可以同时 fetch illust 和 novel，默认为 full_tag
            const url = `${PIXIV_HOME_PAGE}/top/${encode}?lang=ja`;
            // const url = `${PIXIV_HOME_PAGE}/artworks/${encode}?word=${encode}&s_mode=${searchMode}${others}`;
            // rangeUrl，其余与普通url一致
            // const url = `${pixivHomePage}/artworks/${encode}?word=${encode}&s_mode=${s_mode}${range}${others}`;
            // r18;
            // const url = `${pixivHomePage}/artworks/${encode}?word=${encode}&order=date_d&mode=r18&p=1&s_mode=s_tag_full&type=all&lang=ja`;
            // novel
            // const url = `${pixivHomePage}/novels/${encode}?word=${encode}&order=date_d&mode=all&p=1&s_mode=s_tag_full&lang=ja`;
            console.log(`${pixivTag}fetch start：${PIXIV_HOME_PAGE}/top/${pixivTag}?lang=ja`);
            const data = await fetch(url);
            if (data.ok) {
                const result = await data.json();
                // pixiv 默认也会返回 0，还是别保险了，报错发现问题
                illusts.push(result.body.illustManga.total);
                novels.push(result.body.novel.total);
                // tags.push(result.body.novel.total)
            }
            else {
                illusts.push(0);
                novels.push(0);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    return { illusts, novels };
}

async function postRecord({
    projectName,
    records,
    recordType = 'pixiv_illust',
    route = 'character_tag/create_project_chara_record',
}) {
    const date = new Date();
    const url = `${HOST}/${route}`;
    const res = await fetch(url, {
        method: 'post',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `projectName=${projectName}&records=${JSON.stringify(records)}&date=${date}&recordType=${recordType}`,
    });
    const response = await res.text();
    console.log(`${projectName} ${recordType} response:`, response);
}

async function getPixivCharacterTagCount() {
    console.log('==== fetch character start');
    const data = await fetch(`${HOST}/member_info/chara_tag_list`);
    const characterTagLists = await data.json();
    console.log('characterTagLists:', characterTagLists);

    for (const { projectName, pixivTags } of characterTagLists) {
        const { illusts, novels } = await fetchPixivTagCount({ pixivTags });
        console.log(projectName, 'illust', illusts);
        console.log(projectName, 'novel', novels);
        postRecord({
            projectName,
            records: illusts,
        });
        postRecord({
            projectName,
            records: novels,
            recordType: 'pixiv_novel',
        });
    }
    console.log('==== fetch character end');
}

await getPixivCharacterTagCount();

async function getPixivCoupleTagCount() {
    console.log('==== fetch couple start');
    const data = await fetch(`${HOST}/member_info/couple_tag_list`);
    const coupleTagLists = await data.json();
    console.log('coupleTagLists:', coupleTagLists);
    const route = 'couple_tag/create_project_couple_record';

    for (const { projectName, pixivTags } of coupleTagLists) {
        const { illusts, novels } = await fetchPixivTagCount({ pixivTags });
        console.log(projectName, 'illust', illusts);
        console.log(projectName, 'novel', novels);

        postRecord({
            projectName,
            records: illusts,
            route,
        });
        postRecord({
            projectName,
            route,
            records: novels,
            recordType: 'pixiv_novel',
        });
    }

    for (const { projectName, pixivReverseTags } of coupleTagLists) {
        const { illusts, novels } = await fetchPixivTagCount({ pixivTags: pixivReverseTags });

        console.log(projectName, 'illust_reverse', illusts);
        console.log(projectName, 'novel_reverse', novels);

        postRecord({
            projectName,
            route,
            records: illusts,
            recordType: 'pixiv_illust_reverse',
        });
        postRecord({
            projectName,
            route,
            records: novels,
            recordType: 'pixiv_novel_reverse',
        });
    }

    for (const { projectName, pixivIntersectionTags } of coupleTagLists) {
        const { illusts, novels } = await fetchPixivTagCount({
            pixivTags: pixivIntersectionTags,
        });
        console.log(projectName, 'illust_intersection', illusts);
        console.log(projectName, 'novel_intersection', novels);

        postRecord({
            projectName,
            route,
            records: illusts,
            recordType: 'pixiv_illust_intersection',
        });

        postRecord({
            projectName,
            route,
            records: novels,
            recordType: 'pixiv_novel_intersection',
        });
    }
    console.log('==== fetch couple end');
}

await getPixivCoupleTagCount();
