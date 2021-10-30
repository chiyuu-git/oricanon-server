/* eslint-disable unicorn/prefer-module */
/**
 * @file 获取声优推特follower的爬虫脚本
 */

import * as superagent from 'superagent';
import cheerio from 'cheerio';
import { ProjectName } from '@chiyu-bit/canon.root';

const HOST = 'http://localhost:3000';
const SEIYUU_SITE = 'https://headline.client.jp/ranking_f.html';

type TwitterFollowerList = {
    projectName: ProjectName;
    twitterAccounts: string[];
}[]

// 找到每个账号对应的fo数
// Cheerio<Element>不是常规的Element，不好做类型处理，先置为 any
function findFollowerCount(accounts: string[], allAccountNode: any): number[] | false {
    if (accounts.length === 0) {
        return false;
    }
    return accounts.map((account) => {
        let follower = 0;
        allAccountNode.filter((i, el) => {
            const textNode = el.children[0];
            if (!textNode) {
                return false;
            }

            const seiyuuInfo = textNode.data.split(' ');
            const name = seiyuuInfo[3];
            if (account === seiyuuInfo[2]) {
                // 找到记录fo数的节点
                follower = el.parent.next.next.children[0].data * 1;
                return true;
            }
            return true;
        });
        return follower;
    });
}

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
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `projectName=${projectName}&records=${JSON.stringify(records)}&date=${date}`,
    });
    const response = await res.json();
    const result = await response.json
        ? response.json()
        : response;
    console.log(`${projectName} response:`, result);
}

export async function fetchTwitterFollower() {
    try {
    // 获取 seiyuu twitterAccount
        const response = await superagent.get(`${HOST}/member_list/all_seiyuu_twitter_account`);
        const twitterFollowerList: TwitterFollowerList = response.body;

        // 获取网页上所有的推特账号
        const html = await superagent.get(SEIYUU_SITE);
        const $ = cheerio.load(html.text);
        const allAccountNode = $('#f_rank>tbody>tr>td>a');

        for (const { projectName, twitterAccounts } of twitterFollowerList) {
            // map 推特账号数组
            const records = findFollowerCount(twitterAccounts, allAccountNode);

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
