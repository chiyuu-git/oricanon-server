/* eslint-disable unicorn/prefer-module */
/**
 * @file 获取声优推特follower的爬虫脚本，用于 chrome 控制台
 */

const HOST = 'http://127.0.0.1:3000';
const SEIYUU_FOLLOWER_SITE = 'http://headline.client.jp/ranking_f.html';

async function postFollowerRecord({
    projectName,
    records,
}) {
    const date = new Date();
    // 网站在第二天更新0点时的数据，标记为23：59分
    date.setDate(date.getDate() - 1);

    const url = `${HOST}/seiyuu_follower`;
    const res = await fetch(url, {
        method: 'post',
        mode: 'cors',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `projectName=${projectName}&records=${JSON.stringify(records)}&date=${date}`,
    });
    const result = await res.text();
    console.log(`${projectName} response:`, result);
}

// 找到每个账号对应的fo数
// Cheerio<Element>不是常规的Element，不好做类型处理，先置为 any
function findFollowerCount(accounts, allAccountNode) {
    if (accounts.length === 0) {
        return false;
    }
    return accounts.map((account) => {
        let follower = 0;
        allAccountNode.filter((el) => {
            const textNode = el.textContent;
            if (!textNode) {
                return false;
            }

            const seiyuuInfo = textNode.split(' ');
            const name = seiyuuInfo[3];
            if (account === seiyuuInfo[2]) {
                // 找到记录fo数的节点
                follower = el.parentElement.parentElement.children[3].textContent * 1;
                return true;
            }
            return false;
        });
        return follower;
    });
}

async function fetchTwitterFollower() {
    try {
        const response = await fetch(`${HOST}/member_list/all_seiyuu_twitter_account`);
        const twitterFollowerList = response.body;

        // 获取 seiyuu twitterAccount
        const allAccountNode = document.querySelectorAll('#f_rank>tbody>tr>td>a');

        for (const { projectName, twitterAccounts } of twitterFollowerList) {
            // map 推特账号数组
            const records = findFollowerCount(twitterAccounts, [...allAccountNode]);

            console.log('projectName:', projectName);
            console.log('fos:', records);
            postFollowerRecord({
                projectName,
                records,
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}

fetchTwitterFollower();

