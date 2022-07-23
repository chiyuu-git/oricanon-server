// https://stackoverflow.com/questions/69087292/requirenode-fetch-gives-err-require-esm
// v3 不支持 commonjs
import { GetMemberInfoByCategory } from '@common/member-info';
import { RecordType } from '@common/record';
import { Category, ProjectName } from '@common/root';
import { formatDate } from '@utils/date';
import fetch from 'node-fetch';
import { HOST } from './constant';

type CreateArticle = {
    account: string;
    uri: string;
    createdAt: Date;
    platformType: string;
    appendixType: string | null;
}

type CreateArticleInteractDataDto = {
    uri: string;
    replyCount: number;
    retweetCount: number;
    quoteCount: number;
    favoriteCount: number;
    recordDate: string;
}

type QueryProjectMembersDto = {
    category: Category;
    projectName: ProjectName;
    onlyActive?: boolean;
}

export type PostProjectRecord = {
    route: string;
    projectName: ProjectName;
    recordType: RecordType;
    records: number[];
    onlyActive: boolean;
}

/**
 * @file 对原生fetch进行包装 方便使用
 */

 type FetchMethod = 'GET' | 'POST';
 type FetchParam = Record<string | number | symbol, unknown>;

/**
  * 返回一个promise，外部可以通过then在获取到数据后再继续操作
  *
  * @param requestUrl
  * @param method
  * @param params
  * @returns Promise
  */
export async function enhanceFetch(
    requestUrl = '',
    params: FetchParam = {},
    method: FetchMethod = 'GET',
) {
    let url = requestUrl;

    let response: Response = null as unknown as Response;

    // 无论是GET还是POST都需要拼接参数
    let query = '';
    for (const [key, value] of Object.entries(params)) {
        // 即使 value 为 undefined 也照样拼接
        const shouldStringify = typeof value === 'object' && !(value instanceof Date);
        const valStr = shouldStringify ? JSON.stringify(value) : value;
        query += `${key}=${valStr}&`;
    }
    // 去除最后一个 &
    if (query) {
        query = query.slice(0, -1);
    }

    if (method === 'GET' && query) {
        url += `?${query}`;
    }

    // 不同的请求不同的fetch
    switch (method) {
        case 'GET':
            response = await fetch(url);
            break;
        case 'POST':
            response = await fetch(url, {
                method,
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: query,
                mode: 'cors',
            });
            break;
        default:
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
        if (isJson) {
            console.log('Request Error:', await response.json());
        }
        console.log('Request Error:', await response.text());
        return null;
    }

    return isJson ? response.json() : response.text();
}

export async function postProjectFollowerRecord({
    projectName,
    records,
}: { projectName: string; records: number[];}) {
    const date = new Date();
    // 网站在第二天更新0点时的数据，标记为23：59分
    date.setDate(date.getDate() - 1);

    const url = `${HOST}/person_follower/create_project_record`;
    const res = await fetch(url, {
        method: 'post',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `projectName=${projectName}&records=${JSON.stringify(records)}&date=${date}&recordType=twitter_follower`,
    });
    const result = await res.text();
    console.log(`${projectName} response:`, result);
}

export async function createArticle(body: CreateArticle) {
    const url = `${HOST}/twitter/update_article`;
    const result = await enhanceFetch(url, body, 'POST');
    console.log('createArticleResult:', result);
    return result;
}
export async function createArticleInteractData(body: CreateArticleInteractDataDto) {
    const url = `${HOST}/twitter/create_article_interact_data`;
    const result = await enhanceFetch(url, body, 'POST');
    console.log('createArticleInteractDataResult:', result);
    return result;
}

export async function getLiellaTwitterAccountList() {
    const result = await enhanceFetch(`${HOST}/member_info/person_twitter_account_list`);
    return result[2].twitterAccounts;
}

export function getProjectMembersOfCategory<Type extends Category>(
    query: QueryProjectMembersDto,
): Promise<GetMemberInfoByCategory<Type>[]> {
    return enhanceFetch(`${HOST}/member_info/project_member_list_of_category`, query);
}

export async function postProjectRecord(body: PostProjectRecord) {
    const {
        projectName,
        records,
        recordType,
        route,
        onlyActive,
    } = body;
    const date = formatDate(new Date());
    const url = `${HOST}/${route}`;
    const res = await enhanceFetch(url, {
        projectName,
        recordType,
        records,
        date,
        onlyActive,
    }, 'POST');
    console.log(`${projectName} ${recordType} response:`, res);
}
