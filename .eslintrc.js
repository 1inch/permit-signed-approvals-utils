module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'unused-imports'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    rules: {
        '@typescript-eslint/member-ordering': 'error',
        'lines-between-class-members': 'error',
        'padding-line-between-statements': 'error',
        'no-unused-vars': 'off',
        'max-len': ['error', {code: 100}],
        'max-depth': ['error', 3],
        'max-lines-per-function': ['error', 40],
        'max-params': ['error', 6],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': [
            "warn",
            {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }
        ],
        'unused-imports/no-unused-imports': 'error'
    },
    overrides: [
        {
            files: ['src/**/*.test.ts', 'src/**/*.e2e.ts'],
            rules: {
                'max-lines-per-function': ['error', 400],
                'max-len': ['error', {code: 300}],
            },
        },
    ],
};
