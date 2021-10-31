const infoWrap = document.querySelector('#socialblade-user-content>div:nth-child(5)');

const { children } = infoWrap;
// 默认是30
const len = children.length;
// 逆序查找 最新的，跳过最后一个清楚浮动的div
const countArr = [];

// 从 children[28] 即上周四开始获取到上上周六，共6组数据
let index = len - 3;
while (index > 0) {
    index--;

    const row = children[index];
    console.log('row:', row);
    const date = row.children[0].children[0].textContent;
    const followerStr = row.children[1].children[1].textContent;
    // 仅保留数字
    const followerCount = followerStr.replace(/\D/g, '');
    console.log('date:', date, 'followerCount:', followerCount);
    countArr.push({
        date, followerCount,
    });
}

console.log('countArr:', JSON.stringify(countArr));

