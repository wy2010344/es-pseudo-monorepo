import baseConfig from './index.js'

import globals from 'globals'
/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,

  // DOM/浏览器专用配置
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'no-cond-assign': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      // 允许未使用的变量和导入
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',

      // 允许 any 类型
      '@typescript-eslint/no-explicit-any': 'off',

      // 允许非空断言
      '@typescript-eslint/no-non-null-assertion': 'off',

      // 允许空对象类型
      '@typescript-eslint/no-empty-object-type': 'off',

      // 允许 Function 类型
      '@typescript-eslint/no-unsafe-function-type': 'off',

      // 允许 this 别名
      '@typescript-eslint/no-this-alias': 'off',

      // 允许重新声明变量
      'no-redeclare': 'off',

      // 允许空的 catch 块
      'no-empty': 'off',

      // 允许使用 var
      'no-var': 'off',

      // 允许字符串拼接
      'prefer-template': 'off',

      // 允许不必要的转义
      'no-useless-escape': 'off',

      // 允许对象属性简写
      'object-shorthand': 'off',

      // 允许使用 || 而不是 ??
      '@typescript-eslint/prefer-nullish-coalescing': 'off',

      // 允许不使用可选链
      '@typescript-eslint/prefer-optional-chain': 'off',

      // 允许使用 Object 类型
      '@typescript-eslint/no-wrapper-object-types': 'off',
    },
  },
]
