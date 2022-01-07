/* eslint-disable unicorn/prefer-module */
/**
 * @file 获取声优推特follower的爬虫脚本
 */

import * as superagent from 'superagent';
import cheerio from 'cheerio';
import { ProjectName } from '@common/root';
import { postProjectFollowerRecord } from './common';
import { HOST, WEEKLY_SEIYUU_SITE } from './constant';

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

export async function fetchTwitterFollower() {
    try {
    // 获取 seiyuu twitterAccount
        const response = await superagent.get(`${HOST}/member_info/seiyuu_twitter_account_list`);

        const twitterAccountList: TwitterFollowerList = response.body;

        // 获取网页上所有的推特账号
        const html = await superagent
            .get(WEEKLY_SEIYUU_SITE)
        // eslint-disable-next-line max-len
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36')
            .set('Host', 'headline.client.jp');
        // .set('Referer', 'http://www.xxx.net/');
        const $ = cheerio.load(html.text);
        const allAccountNode = $('#f_rank>tbody>tr>td>a');

        for (const { projectName, twitterAccounts } of twitterAccountList) {
            // map 推特账号数组
            const records = findFollowerCount(twitterAccounts, allAccountNode);

            console.log('projectName:', projectName);
            console.log('fos:', records);
            postProjectFollowerRecord({
                projectName,
                records,
            });
        }
    }
    catch (error) {
        console.log(error);
    }
}
