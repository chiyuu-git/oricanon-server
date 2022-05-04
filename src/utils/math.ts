/**
 * 接受一个已排序的数组，返回对应百分位的数值
 *
 * @param percentile 表示百分位的整数，比如：80 代表要获取80分位数
 */
export function getPercentile(array: number[], percentile: number) {
    const len = array.length;
    const percentileIndex = (len + 1) * (percentile / 100);

    if (Number.isInteger(percentileIndex)) {
        // index 是整数
        return array[percentileIndex];
    }

    // 非整数
    const integer = Math.floor(percentileIndex);
    const decimal = percentileIndex - integer;
    const result = array[integer] + decimal * (array[integer + 1] - array[integer]);
    return +result.toFixed(2);
}
