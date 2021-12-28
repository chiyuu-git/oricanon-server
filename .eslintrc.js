const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
    extends: [
        '@chiyu-git/eslint-config-basic',
    ],
    rules: {
        // 因为 nestjs 的设计问题 空的 constructor 存在依赖注入，无法去除
        'no-useless-constructor': OFF,
        'max-classes-per-file': OFF,
        // 这个建议太超前了， node 16 版本才可以使用
        'unicorn/prefer-node-protocol': OFF,
        // 关闭 js 的检查，仅使用 ts 的以允许类方法重载
        'lines-between-class-members': OFF,
        '@typescript-eslint/lines-between-class-members': [ERROR, 'always', { 'exceptAfterOverload': true }],
    },
};
