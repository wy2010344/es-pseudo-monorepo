# Packages

这个目录包含所有可发布的包，每个子目录都是一个独立的 GitHub 仓库。

## 结构

```
packages/
├── mve/              # MVE 相关包的仓库
│   ├── core/         # 核心包
│   ├── dom/          # DOM 相关包
│   ├── helper/       # 辅助工具包
│   └── ...
└── wy-helper/        # WY Helper 相关包的仓库
    ├── wy-helper/    # 主包
    ├── wy-dom-helper/# DOM 辅助包
    └── ...
```

## 添加新包

1. 在对应的仓库目录下创建新的包目录
2. 添加 `package.json` 和源代码
3. 使用 `workspace:*` 引用其他本地包
4. 运行 `pnpm run setup-hooks` 设置 Git 钩子

## 发布流程

1. 使用 `pnpm changeset` 记录变更
2. 运行 `pnpm version-packages` 更新版本
3. 运行 `pnpm release` 发布到 npm