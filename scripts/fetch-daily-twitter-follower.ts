/* eslint-disable unicorn/prefer-module */
/**
 * @file 获取声优推特follower的爬虫脚本
 *
 * 1. 通过 http.get 获取 pac 脚本 string code
 * 2. 使用 pac-resolver ，传入 pac string code，获取代理服务器的地址
 * 3. 使用 superagent-proxy，代理请求，剩下的常规工作，不再赘述
 */

import * as superagent from 'superagent';
import cheerio from 'cheerio';
import { ProjectName } from '@chiyu-bit/canon.root';
import { postFollowerRecord } from './utils';
import { HOST, DAILY_SEIYUU_SITE } from './constant';

 type TwitterFollowerList = {
     projectName: ProjectName;
     twitterAccounts: string[];
 }[]

export async function fetchDailyTwitterFollower() {
    try {
    // 获取 seiyuu twitterAccount
        const response = await superagent.get(`${HOST}/member_list/all_seiyuu_twitter_account`);
        const twitterFollowerList: TwitterFollowerList = response.body;

        // 获取网页上所有的推特账号
        const html = await superagent.get(DAILY_SEIYUU_SITE);
        const $ = cheerio.load(html.text);
        const allDailyInfo = $('#socialblade-user-content>div:nth-child(5)');
        console.log('allDailyInfo:', allDailyInfo);

        for (const { projectName, twitterAccounts } of twitterFollowerList) {
            // map 推特账号数组
            // const records = findFollowerCount(twitterAccounts, allAccountNode);

            // console.log('projectName:', projectName);
            // console.log('fos:', records);
            // postFollowerRecord({
            //     projectName,
            //     records,
            // });
        }
    }
    catch (error) {
        console.log(error);
    }
}
