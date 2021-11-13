import fetch from 'node-fetch';
import { llTotalViewCounts, llDailyViewCounts } from './view-data';

export function format() {
    const totalViewCounts = llTotalViewCounts;
    const dailyViewCounts = llDailyViewCounts;

    const formatDate = function (dateStr: string | Date): string {
        const date = new Date(dateStr);
        return date.toJSON().split('T')[0];
    };

    const recordWithDate = {};

    // 选算出周五标准 fetchDay的 totalCount 记录到 character_tag 表中
    for (const [i, tagTotalView] of totalViewCounts.entries()) {
    // tagView 角色标签的总浏览数
    // 该角色该表现近半年来每一天的浏览数
        const characterDailyCounts = dailyViewCounts[i];

        let n = 5;
        let currentDate = '2021-11-30';
        let tagTotalViewOfDate = +tagTotalView;
        while (n >= 0) {
            const tagViewOfMonth = characterDailyCounts[n];
            let m = tagViewOfMonth.length - 1;

            while (m >= 0) {
                const tagViewOfToday = tagViewOfMonth[m];

                if (tagViewOfToday === 0 && new Date(currentDate).getMonth() !== 10) {
                    m--;
                    continue;
                }

                tagTotalViewOfDate -= tagViewOfToday;

                if (recordWithDate.hasOwnProperty(currentDate)) {
                    recordWithDate[currentDate].push(tagTotalViewOfDate);
                }
                else {
                    recordWithDate[currentDate] = [tagTotalViewOfDate];
                }

                m--;
                const date = new Date(currentDate).getDate();
                const curDate = new Date(currentDate);
                curDate.setDate(date - 1);
                // 日期设置成前一天
                currentDate = formatDate(curDate);
            }

            // 一组遍历完了
            n--;
        }
    }

    // console.log('recordWithDate:', recordWithDate);

    function getFetchWeekDay(date: Date) {
        const breakChangeDate = new Date('2020-9-18');
        if (date >= breakChangeDate) {
            return 5;
        }
        return 6;
    }

    function getPrevWeeklyFetchDate(base: string) {
        const baseDate = new Date(base);
        const fetchWeekDay = getFetchWeekDay(baseDate);
        const baseWeekday = baseDate.getDay();

        // 如果是星期天，或者是大于fetchWeekday，则与抓取日是在同一个星期
        // 如果是小于等于抓取日，则需要获取上一个星期的抓取日
        let diff = null;
        if (baseWeekday === 0) {
            diff = 7 - fetchWeekDay;
        }
        else if (baseWeekday > fetchWeekDay) {
            diff = baseWeekday - fetchWeekDay;
        }
        else if (baseWeekday <= fetchWeekDay) {
            diff = 7 - fetchWeekDay + baseWeekday;
        }
        // 重设抓取日的日期
        const lastFetchDate = new Date(baseDate);
        lastFetchDate.setDate(lastFetchDate.getDate() - diff);
        return formatDate(lastFetchDate);
    }

    async function postRecord({
        projectName,
        records,
        date,
        type = 'pixiv_tag_view',
    }) {
        const url = 'http://localhost:3000/character_tag';
        const res = await fetch(url, {
            method: 'post',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: `projectName=${projectName}&records=${JSON.stringify(records)}&date=${date}&type=${type}`,
        });
        const response = await res.text();
        console.log(`${projectName} ${type} response:`, response);
    }

    let fetchDate = getPrevWeeklyFetchDate('2021-11-06');

    while (recordWithDate[fetchDate]) {
        const records = recordWithDate[fetchDate];
        // postRecord({
        //     projectName: 'lovelive',
        //     records,
        //     date: fetchDate,
        // });
        // console.log(fetchDate, records);

        fetchDate = getPrevWeeklyFetchDate(fetchDate);
    }
}

