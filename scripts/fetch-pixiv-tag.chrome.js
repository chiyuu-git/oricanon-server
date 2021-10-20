/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
/**
 * @file 用于在chrome控制台获取 pixivTags
 */

/**
 * encode 字段 获取users入り时需要修改
 *
 * @param users入り 50 | 100 | 500 | 1000 | 5000 | 10000
 */
// const encode = encodeURI(members[i] + ' 10000users入り');
const PIXIV_HOME_PAGE = 'https://www.pixiv.net/ajax/search';

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

async function fetchPixivTagsInOrder({
    pixivTags,
    // search_mode有两种情况, s_tag_full | s_tag
    searchMode = 's_tag_full',
}) {
    const tags = [];
    try {
        for (const pixivTag of pixivTags) {
            const encode = encodeURI(pixivTag);

            const url = `${PIXIV_HOME_PAGE}/artworks/${encode}?word=${encode}&s_mode=${searchMode}${others}`;
            // rangeUrl，其余与普通url一致
            // const url = `${pixivHomePage}/artworks/${encode}?word=${encode}&s_mode=${s_mode}${range}${others}`;
            // r18;
            // const url = `${pixivHomePage}/artworks/${encode}?word=${encode}&order=date_d&mode=r18&p=1&s_mode=s_tag_full&type=all&lang=ja`;
            // novel
            // const url = `${pixivHomePage}/novels/${encode}?word=${encode}&order=date_d&mode=all&p=1&s_mode=s_tag_full&lang=ja`;
            console.log(`${pixivTag} ${searchMode} fetch start `);
            const data = await fetch(url);
            const result = await data.json();
            tags.push(result.body.illustManga.total);
            // tags.push(result.body.novel.total)
        }
    }
    catch (error) {
        console.log(error);
    }
    return tags;
}

async function postNewRecord({
    projectName,
    records,
    type = 'pixiv_illust',
    route = 'character_tag',
}) {
    const date = new Date();
    const url = `http://localhost:3000/${route}`;
    const res = await fetch(url, {
        method: 'post',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `projectName=${projectName}&records=${JSON.stringify(records)}&date=${date}&type=${type}`,
    });
    const response = await res.json();
    console.log(`${projectName} ${type} response:`, response);
}

async function fetchPixivCharacterTag() {
    console.log('==== fetch character start');
    const data = await fetch('http://localhost:3000/member_list/all_character_tag');
    const characterTagLists = await data.json();
    console.log('characterTagLists:', characterTagLists);

    for (const { projectName, pixivTags } of characterTagLists) {
        const records = await fetchPixivTagsInOrder({ pixivTags });
        console.log(projectName, records);
        postNewRecord({ projectName, records });
    }
    console.log('==== fetch character end');
}

await fetchPixivCharacterTag();

async function fetchPixivCoupleTag() {
    console.log('==== fetch couple start');
    const data = await fetch('http://localhost:3000/member_list/all_couple_tag');
    const coupleTagLists = await data.json();
    console.log('coupleTagLists:', coupleTagLists);
    const route = 'couple_tag';

    for (const { projectName, pixivTags } of coupleTagLists) {
        const records = await fetchPixivTagsInOrder({ pixivTags });
        console.log(projectName, records);

        postNewRecord({
            projectName,
            records,
            route,
        });
    }

    for (const { projectName, pixivReverseTags } of coupleTagLists) {
        const records = await fetchPixivTagsInOrder({ pixivTags: pixivReverseTags });
        // 填充 0
        const fillRecords = Array.from({ length: 10 }).fill(0);
        fillRecords[0] = records[0];
        fillRecords[5] = records[6];
        console.log(projectName, fillRecords);

        postNewRecord({
            projectName,
            records: fillRecords,
            type: 'pixiv_illust_reverse',
            route,
        });
    }

    for (const { projectName, pixivIntersectionTags } of coupleTagLists) {
        const records = await fetchPixivTagsInOrder({
            pixivTags: pixivIntersectionTags,
            searchMode: 's_tag',
        });
        // 填充 0
        const fillRecords = Array.from({ length: 10 }).fill(0);
        fillRecords[0] = records[0];
        fillRecords[5] = records[6];
        console.log(projectName, fillRecords);

        console.log(projectName, records);
        postNewRecord({
            projectName,
            records,
            type: 'pixiv_illust_intersection',
            route,
        });
    }
    console.log('==== fetch couple end');
}

await fetchPixivCoupleTag();
