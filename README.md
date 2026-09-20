# Pseudo MonoRepo

基于 pnpm workspace + turbo + changesets 的多包仓库。

## 项目结构

```
├── packages/                     # 公开发布包
│   ├── better-react/             # better-react 系列（core/dom/dom-helper/helper + demo/website）
│   ├── mve/                      # MVE 系列（core/dom/dom-helper/helper/convex-mve/daisy-mobile-helper/mve-three + demo/website）
│   ├── wy-helper/                # wy-helper / wy-dom-helper
│   └── wy-react-helper/          # wy-react-helper / wy-react-dom-helper / wy-react-native + website
├── apps/                         # 应用项目（私有）
│   ├── mve-vite-demo/            # MVE Vite 演示
│   ├── react-vite-demo/          # React Vite 演示
│   ├── better-react-demos/
│   ├── thread-task/ todo/ verify-app/ selfTest/
│   └── chat-note/                # 独立应用树（client/server/cordova 等，不在本仓版本控制内）
├── config/                       # 共享配置包（@repo/eslint-config、@repo/typescript-config、@repo/prettier-config）
└── x-manage/                     # 嵌入式独立仓库（私有）
```

## 特点

- **Workspace 管理**：`pnpm-workspace.yaml` 定义 `packages/*/*`、`apps/*`、`config/*`、`x-manage/*` 等 glob
- **Changesets 发布**：只有 `packages/` 下的库包参与发布，demo/website/apps/x-manage 通过 `.changeset/config.json` 的 `ignore` 排除
- **构建**：库包使用 tsdown 生成 ESM + CJS 双格式（`convex-mve` 例外，目标为 Convex 运行时，保持 ESM-only）
- **类型安全**：完整 TypeScript 支持（`config/typescript-config`）

## 快速开始

```bash
pnpm install       # 安装依赖
pnpm run build     # 构建所有包
```

日常命令（根 `package.json` 脚本，经 turbo 调度）：

```bash
pnpm run build       # 构建
pnpm run dev         # watch 模式
pnpm run test        # 测试
pnpm run type-check  # 类型检查
pnpm run lint        # ESLint（自动修复）
pnpm run lint:check  # ESLint（仅检查）
pnpm run format      # Prettier（自动修复）
pnpm run format:check
pnpm run clean
```

## 发布流程（changesets）

只影响 `packages/` 下的 16 个库包；demo/website/apps/x-manage 已配置为 `ignore`，不会出现在选择列表。

```bash
pnpm changeset             # 记录变更（选择要发布的包 + bump 级别）
pnpm changeset version     # 应用 changeset，更新版本号与 changelog
pnpm changeset publish     # 发布变更的包到 npm
```

> 注意：
> 1. 库包之间通过 `peerDependencies: "workspace:^"` 互引。发布时 pnpm 会替换为 `^x.y.z`，保证下游兼容 `^` 范围内的升级。请勿改回 `workspace:*`，否则会退化为对接精确版本并导致 changeset 联动全仓发布。
> 2. 发布凭证通过环境变量 `NODE_AUTH_TOKEN` 提供，不要在 `.npmrc` 等文件里明文存放 token。
> 3. `.npmrc`、`packages/*`、`apps/*`、`x-manage/` 均不纳入主仓版本控制；子项目在各自仓库中管理。

## 代码风格与 Git 钩子

- ESLint / Prettier / TypeScript 统一由 `config/` 下的 `@repo/*` 配置包提供
- Husky + lint-staged + commitlint + commitizen（`pnpm run commit`）管理提交约定

## 说明

- 本仓库作为"架子"：主仓跟踪根级配置与 `config/`，`packages/*`、`apps/*`、`x-manage/` 均在 `.gitignore` 中忽略
- 修改发布包的 `package.json`（如依赖范围）后，记得 `pnpm install` 同步 `pnpm-lock.yaml`