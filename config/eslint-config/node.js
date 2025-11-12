import baseConfig from './index.js';
import globals from "globals";
/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  
  // 忽略不需要检查的文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      'coverage/**',
      '.turbo/**',
      'build/**',
      'out/**',
    ],
  },
  
  // Node.js 特定配置
  {
    files: ['src/**/*.js', 'src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-non-null-asserted-optional-chain':'off',
      'no-cond-assign':'off',
      '@typescript-eslint/no-unused-expressions':'off',
      // Node.js 特定规则
      'no-console': 'off', // Node.js 中允许 console
      'no-process-exit': 'off', // 允许 process.exit
      'no-process-env': 'off',
      'no-undef': 'off', // 关闭未定义变量检查，因为 TypeScript 会处理
      
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
      
      // 允许重新声明变量（在某些情况下是必要的）
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      
      // 允许空块语句
      'no-empty': 'off',
      
      // 允许使用 var
      'no-var': 'off',
      
      // 允许 prefer-const 警告而不是错误
      'prefer-const': 'warn',
      
      // 允许不必要的转义字符
      'no-useless-escape': 'off',
      
      // 允许 this 别名
      '@typescript-eslint/no-this-alias': 'off',
      
      // 将 nullish coalescing 改为警告
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    },
  },
];