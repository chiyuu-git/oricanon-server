export interface EventInfo {
    date: string;
    title: string;
    content: {
        articleUrl: string[];
    };
}

/**
 * 必须按照日期时间顺序存储新闻
 */
export interface EventList {
    [date: string]: EventInfo;
}

/**
 * 以 fetchDate 为 key，存储过去一周内的所有新闻
 */
export interface WeeklyEventMap {
    [fetchDate: string]: EventInfo[];
}
