/**
 * @file type-transformer 的工具函数
 */

export function transformToArray({ value }: {value: unknown;}) {
    return Array.isArray(value) ? value : [value];
}

