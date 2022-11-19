/**
 * 变量名形式转换的工具函数集
 */
export function underscore2Camel(identified: string) {
    const regex = /_(\w)/g;
    return identified.replace
        ? identified.replace(regex, (match, p) => p.toUpperCase())
        : identified;
}
