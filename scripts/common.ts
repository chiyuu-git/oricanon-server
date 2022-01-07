// https://stackoverflow.com/questions/69087292/requirenode-fetch-gives-err-require-esm
// v3 不支持 commonjs
import fetch from 'node-fetch';
import { HOST } from './constant';

export async function postProjectFollowerRecord({
    projectName,
    records,
}) {
    const date = new Date();
    // 网站在第二天更新0点时的数据，标记为23：59分
    date.setDate(date.getDate() - 1);

    const url = `${HOST}/seiyuu_follower/create_project_seiyuu_record`;
    const res = await fetch(url, {
        method: 'post',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `projectName=${projectName}&records=${JSON.stringify(records)}&date=${date}`,
    });
    const result = await res.text();
    console.log(`${projectName} response:`, result);
}
