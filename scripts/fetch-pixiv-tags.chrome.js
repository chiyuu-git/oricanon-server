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
const pixivHomePage = 'https://www.pixiv.net/ajax/search';

const full = 's_tag_full'; // search_mode有两种情况, s_tag_full |

/**
 * search_type有两种情况, artworks | novels
 * artworks 获取的是插画及漫画，不包括小说
 */
const s_type = 'artworks';

/**
 *
 */
const RANGE_START = '2021-04-03';
const RANGE_END = '2021-04-09';
const range = `&scd=${RANGE_START}&ecd=${RANGE_END}`;

/**
 * @param model 可以为r18
 * @param type 统一为全部，包括插画、漫画、动图
 * @param lang 语言参数不影响返回值
 */
const others = '&order=date_d&mode=all&p=1&type=all&lang=ja';

async function fetchTagsInOrder(pixivTags) {
    const tags = [];
    try {
        for (const pixivTag of pixivTags) {
            const encode = encodeURI(pixivTag);

            const url = `${pixivHomePage}/artworks/${encode}?word=${encode}&s_mode=${full}${others}`;
            // rangeUrl，其余与普通url一致
            // const url = `${pixivHomePage}/artworks/${encode}?word=${encode}&s_mode=${s_mode}${range}${others}`;
            // r18;
            // const url = `${pixivHomePage}/artworks/${encode}?word=${encode}&order=date_d&mode=r18&p=1&s_mode=s_tag_full&type=all&lang=ja`;
            // novel
            // const url = `${pixivHomePage}/novels/${encode}?word=${encode}&order=date_d&mode=all&p=1&s_mode=s_tag_full&lang=ja`;
            console.log(`${pixivTag}: ${url} fetch start `);
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

function postNewRecord(name, tags) {
    fetch('http://127.0.0.1:8000/newRecord', {
        method: 'post',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `name=${name}&tags=${JSON.stringify(tags)}`,
    });
}

async function fetchPixivTags() {
    console.log('fetch start');
    const data = await fetch('http://localhost:3000/memberLists/all_pixiv_tags');
    const tagLists = await data.json();
    console.log('tagLists:', tagLists);
    for (const { projectName, pixivTags } of tagLists) {
        const tags = await fetchTagsInOrder(pixivTags);
        console.log(projectName, tags);
        postNewRecord(projectName, tags);
    }
    console.log('fetch end');
}

fetchPixivTags();
