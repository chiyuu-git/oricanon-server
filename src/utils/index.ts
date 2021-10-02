/**
 * 返回 YYYY-MM-DD 类型的字符串
 * @param {string} dateStr
 */
export const formatDate = function (dateStr: string): string {
    const date = new Date(dateStr);
    return date.toJSON().split('T')[0];
};
