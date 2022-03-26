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
        'func-names': [WARN, 'as-needed'],
        // 循环引入，在 typeorm 关系的设计下无法避免
        'import/no-cycle': OFF,
        'lines-between-class-members': OFF,
    },
};
