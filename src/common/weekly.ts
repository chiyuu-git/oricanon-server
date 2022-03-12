import { formatDate } from '@utils/date';
import { ProjectName } from './root';

interface ProjectInfo {
    projectName: ProjectName;
    projectTotal: number;
    projectWeekIncrement: number;
    projectWeekIncrementRate: string;
}

export type MemberWeeklyInfo = {
    romaName: string;
    record: number;
    weekIncrement: number;
    weekIncrementRate: string;
}

export interface RecordWeeklyInfo {
    range: string;
    projectInfoList: ProjectInfo[];
    memberInfoList: MemberWeeklyInfo[];
}

/**
 * 如果是9-25，本质还是9-18的lastRecord
 * baseDate 是9-18 fetchDay 应该是 5
 * 只要是小于9-18的 都是 6
 *
 * @private
 * @param {Date} date
 * @return {string} weekday
 */
function getFetchWeekDay(date: Date) {
    const breakChangeDate = new Date('2020-09-18');
    if (date > breakChangeDate) {
        return 5;
    }
    return 6;
}

/**
 * 接受 base，返回last
 * 为了方便回顾每周的，需要方便的查看每一周的数据，因此是以周为单位的
 *
 * @private
 * @param {string} base YYYY-MM-DD
 * @return {string} last YYYY-MM-DD
 */
export function getPrevWeeklyFetchDate(base: string) {
    const baseDate = new Date(base);
    const fetchWeekDay = getFetchWeekDay(baseDate);
    const baseWeekday = baseDate.getDay();

    // 如果是星期天，或者是大于fetchWeekday，则与抓取日是在同一个星期
    // 如果是小于等于抓取日，则需要获取上一个星期的抓取日
    let diff = 0;
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

/**
 * 接受一个date，返回 last，beforeLast 两个个相对的时间点
 *
 * @param {?Date} date
 * @return {Object} YYYY-MM-DD
 */
export const getRelativeDate = function (date: string) {
    const baseDate = date;

    // 根据base计算出last和beforeLast
    const lastDate = getPrevWeeklyFetchDate(baseDate);
    const beforeLastDate = getPrevWeeklyFetchDate(lastDate);

    return [baseDate, lastDate, beforeLastDate];
};
