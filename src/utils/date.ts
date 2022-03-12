/**
 * @file 日期相关的工具函数
 */

/**
 * 返回 YYYY-MM-DD 类型的字符串
 * @param {string} dateStr
 */
export const formatDate = function (dateStr: string | Date): string {
    const date = new Date(dateStr);
    return date.toJSON().split('T')[0];
};

/**
 * 返回两个日期相差天数的绝对值
 */
export const getDayDifferent = function (dateStrA: string | Date, dateStrB: string | Date): number {
    const dateA = new Date(dateStrA);
    const dateB = new Date(dateStrB);
    // 两个日期相差的毫秒数
    const different = dateA.getTime() - dateB.getTime();
    // 返回相差了多少天
    return Math.abs(different / 1000 / 60 / 60 / 24);
};

