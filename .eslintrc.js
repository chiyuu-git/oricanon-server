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

    },
};
