/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
/**
 * @file 用于在chrome控制台获取 pixivTagView
 */

// https://dic.pixiv.net/a/%E7%9F%A2%E6%BE%A4%E3%81%AB%E3%81%93
// <h2>このタグがついたpixivの作品閲覧データ <span class="total-count">総閲覧数: 169190043</span></h2>

// https://dic.pixiv.net/api/tag_count/%E5%94%90%E5%8F%AF%E5%8F%AF?json=1

const PIXIV_DIC_HOME_PAGE = 'https://dic.pixiv.net';
const HOST = 'http://localhost:3000';

async function fetchPixivTotalViewCount(pixivTags) {
    const totalViewCounts = [];
    try {
        for (const pixivTag of pixivTags) {
            const encode = encodeURI(pixivTag);

            // dic url 返回的是html文件
            const url = `${PIXIV_DIC_HOME_PAGE}/a/${encode}`;
            console.log(`${pixivTag}fetch start：${PIXIV_DIC_HOME_PAGE}/a/${pixivTag}`);
            const data = await fetch(url);
            if (data.ok) {
                // 当百科没有对应的词条的时候会返回一个提示的html
                const html = await data.text();
                // 正则匹配 总阅览数
                const viewRegex = /総閲覧数: (\d+)/;
                const [match, p1] = viewRegex.exec(html);
                totalViewCounts.push(+p1);
            }
            else {
                totalViewCounts.push(0);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    return totalViewCounts;
}

async function fetchPixivDailyViewCount(pixivTags) {
    const dailyViewCounts = [];
    try {
        for (const pixivTag of pixivTags) {
            const encode = encodeURI(pixivTag);

            // dic url 返回的是html文件
            const url = `${PIXIV_DIC_HOME_PAGE}/api/tag_count/${encode}?json=1`;
            console.log(`${pixivTag}fetch start：${PIXIV_DIC_HOME_PAGE}/api/tag_count/${pixivTag}?json=1`);
            const data = await fetch(url);
            const result = await data.json();
            // 返回的是一个月份的多维数组
            dailyViewCounts.push(result);
        }
    }
    catch (error) {
        console.log(error);
    }
    return dailyViewCounts;
}

async function postProjectRecord({
    projectName,
    records,
    recordType = 'pixiv_illust',
    route = 'chara_tag/create_project_record',
}) {
    const date = new Date();
    const url = `${HOST}/${route}`;
    const res = await fetch(url, {
        method: 'post',
        mode: 'cors',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `projectName=${projectName}&records=${JSON.stringify(records)}&date=${date}&recordType=${recordType}`,
    });
    const response = await res.text();
    console.log(`${projectName} ${recordType} response:`, response);
}

async function getCharaPixivViewCount() {
    console.log('==== fetch chara view start');
    const data = await fetch(`${HOST}/member_info/chara_tag_list`, { mode: 'cors' });
    const charaTagLists = await data.json();
    console.log('charaTagLists:', charaTagLists);

    for (const { projectName, pixivTags } of charaTagLists) {
        const viewCounts = await fetchPixivTotalViewCount(pixivTags);
        console.log(`${projectName} viewCounts:`, viewCounts);
        // const dailyViewCounts = await fetchPixivDailyViewCount(pixivTags);
        // console.log(`${projectName} dailyViewCounts:`, dailyViewCounts);
        postProjectRecord({
            projectName,
            recordType: 'pixiv_tag_view',
            records: viewCounts,
        });

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                // 300ms 之后再resolve
                resolve();
            }, 300);
        });
    }

    console.log('==== fetch chara view end');
}

await getCharaPixivViewCount();
