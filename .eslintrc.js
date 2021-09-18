const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'plugin:unicorn/recommended',
        'plugin:promise/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['import', 'unicorn', 'promise', '@typescript-eslint', 'prettier'],
    settings: {
        'import/resolver': {
            node: { extensions: ['.tsx', '.ts', '.js', '.json'] },
        },
    },
    rules: {
        'import/extensions': [
            ERROR,
            'ignorePackages',
            {
                ts: 'never',
                tsx: 'never',
                js: 'never',
            },
        ],
        'import/no-extraneous-dependencies': [ERROR, { devDependencies: true }],
        'import/prefer-default-export': OFF,
        'import/no-unresolved': ERROR,
        'import/no-dynamic-require': OFF,

        'unicorn/better-regex': ERROR,
        'unicorn/prevent-abbreviations': OFF,
        'unicorn/filename-case': [
            ERROR,
            {
                cases: {
                    // 中划线
                    kebabCase: true,
                    // 小驼峰
                    camelCase: true,
                    // 下划线
                    snakeCase: false,
                    // 大驼峰
                    pascalCase: true,
                },
            },
        ],
        'unicorn/no-array-instanceof': WARN,
        'unicorn/no-for-loop': WARN,
        'unicorn/prefer-add-event-listener': [ERROR, { excludedPackages: ['koa', 'sax'] }],
        'unicorn/prefer-query-selector': ERROR,
        'unicorn/no-null': OFF,
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-reduce.md
        // Array#reduce() and Array#reduceRight() usually result in hard-to-read and less performant code.
        // In almost every case, it can be replaced by .map, .filter, or a for-of loop.
        // It's only somewhat useful in the rare case of summing up numbers, which is allowed by default.
        'unicorn/no-array-reduce': OFF,

        '@typescript-eslint/no-useless-constructor': ERROR,
        '@typescript-eslint/no-empty-function': WARN,
        '@typescript-eslint/no-var-requires': OFF,
        '@typescript-eslint/explicit-function-return-type': OFF,
        '@typescript-eslint/explicit-module-boundary-types': OFF,
        '@typescript-eslint/no-explicit-any': OFF,
        '@typescript-eslint/no-use-before-define': ERROR,
        '@typescript-eslint/no-unused-vars': WARN,

        // 代码格式相关的，逐步去除
        'prettier/prettier': ERROR,
        'lines-between-class-members': [ERROR, 'always'],
        'no-unused-expressions': WARN,
        'no-plusplus': OFF,
        'no-console': OFF,
        'class-methods-use-this': ERROR,
        'no-continue': ERROR,
        // 换行符，不同的系统不一样，不做要求
        'linebreak-style': OFF,
        // 控制对象、数组的换行，要么全部换行，要么全部不换行，保持一致即可
        'object-curly-newline': [ERROR, { consistent: true }],
        'array-bracket-newline': [ERROR, 'consistent'],
        'array-element-newline': [ERROR, 'consistent'],
    },
    // node 工具链都是js文件，针对这些js文件单独配置部分 rule
    overrides: [{ files: ['**/*.js'], rules: { 'unicorn/prefer-module': OFF } }],
};
