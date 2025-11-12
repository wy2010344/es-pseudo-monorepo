/** @type {import('prettier').Config} */
export default {
  // 基础配置
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  
  // 换行
  printWidth: 80,
  endOfLine: 'lf',
  
  // 括号
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // 特定文件类型
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
      },
    },
  ],
};