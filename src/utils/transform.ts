/**
 * @file type-transformer 的工具函数
 */

export function transformToArray({ value }: {value: unknown;}) {
    return Array.isArray(value) ? value : [value];
}

export function transformToBoolean({ value }: {value: unknown;}) {
    return value !== 'false' && value !== false;
}

