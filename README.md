# Pseudo MonoRepo

这是一个 Pseudo MonoRepo 项目，使用 pnpm + turbo 管理多个独立的 GitHub 仓库。

## 项目结构

```
├── packages/           # 公开包仓库
│   ├── config/        # 配置包（ESLint、Prettier、TypeScript、Scripts）
│   ├── mve/           # MVE 相关包的仓库
│   ├── wy-helper/     # WY Helper 相关包的仓库
│   └── wy-react-helper/ # WY React Helper 相关包的仓库
└── apps/              # 应用项目（可能是私有的）
    ├── mve-vite-demo/ # MVE Vite 演示应用
    └── vite-react-demo/ # Vite React 演示应用
```

## 特点

- **独立仓库**: `packages/` 和 `apps/` 下的每个目录都是独立的 Git 仓库
- **统一管理**: 使用 pnpm workspace 和 turbo 进行统一的依赖管理和构建
- **自动发布**: 支持自动化的包发布流程
- **类型安全**: 完整的 TypeScript 支持

## 快速开始

### 初始化开发环境

```bash
# 克隆主仓库
git clone <your-repo-url>
cd pseudo-monorepo

# 设置开发环境（会自动更新所有子仓库并安装依赖）
pnpm run dev-setup
```

### 日常开发

```bash
# 开发模式（启动所有包的 watch 模式）
pnpm run dev

# 构建所有包
pnpm run build

# 运行测试
pnpm run test

# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint
```

### 包管理

```bash
# 添加依赖到特定包
pnpm add <package> --filter <workspace-name>

# 添加开发依赖
pnpm add -D <package> --filter <workspace-name>

# 在所有包中添加依赖
pnpm add <package> -w
```

### 发布流程

```bash
# 创建 changeset（记录变更）
pnpm changeset

# 更新版本号（应用 changeset）
pnpm changeset version

# 发布变更的包（只发布有版本变更的包）
pnpm changeset publish
```

## 工作流

### 开发新功能

1. 在对应的子仓库中创建分支
2. 开发功能并提交到子仓库
3. 在主仓库中更新子仓库引用
4. 运行测试确保集成正常

### 发布新版本

1. 使用 `pnpm changeset` 记录变更
2. 使用 `pnpm changeset version` 更新版本号
3. 提交变更到对应的子仓库
4. 使用 `pnpm changeset publish` 发布变更的包到 npm

## 开发脚本

项目提供了统一的开发脚本：

- `pnpm run build`: 构建所有包
- `pnpm run dev`: 开发模式
- `pnpm run lint`: 代码检查和修复
- `pnpm run type-check`: 类型检查
- `pnpm run docs`: 生成文档
- `pnpm changeset`: 创建变更记录
- `pnpm changeset version`: 更新版本号
- `pnpm changeset publish`: 发布变更的包

## 配置文件

- `pnpm-workspace.yaml`: pnpm 工作区配置
- `turbo.json`: Turbo 构建配置
- `.changeset/config.json`: Changesets 版本管理配置
- `tsdown.config.ts`: 各包的构建配置（生成 CommonJS 和 ESM 格式）

### 构建配置说明

所有包使用 `tsdown` 进行构建，统一生成：

- `.js` 文件：CommonJS 格式
- `.mjs` 文件：ESM 格式
- `.d.ts` 和 `.d.mts` 文件：TypeScript 类型定义

确保 package.json 中不要添加 `"type": "module"` 字段，以保持文件命名的一致性。

## 代码风格

项目使用统一的代码风格配置：

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Husky**: Git 钩子管理

```bash
# 检查代码风格
pnpm run lint:check

# 自动修复代码风格
pnpm run lint

# 格式化代码
pnpm run format

# 检查格式
pnpm run format:check
```

## Git 钩子

为所有子仓库设置统一的 Git 钩子：

```bash
# 设置钩子
pnpm run setup-hooks
```

钩子功能：

- **pre-commit**: 代码检查和格式化
- **pre-push**: 运行测试

## 注意事项

1. 主仓库作为"架子"，忽略子仓库的 Git 状态
2. 每个子仓库都有自己的 Git 历史，需要单独管理
3. 使用 `workspace:*` 引用本地包，发布时会自动替换为实际版本号
4. 统一的代码风格和 Git 钩子确保代码质量
5. CI/CD 流程会自动处理构建、测试和发布
