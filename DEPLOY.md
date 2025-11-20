# Cloudflare Pages 部署指南

本文档说明如何将 global-exchanges 项目部署到 Cloudflare Pages。

## 前置要求

1. Cloudflare 账户
2. GitHub 仓库已连接到 Cloudflare Pages
3. Gemini API Key

## 部署步骤

### 方法一：通过 Cloudflare Dashboard（推荐）

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 进入 "Workers & Pages" 部分

2. **创建新项目**
   - 点击 "Create application" → "Pages" → "Connect to Git"
   - 选择你的 GitHub 仓库 `zwaydot/global-exchanges`
   - 点击 "Begin setup"

3. **配置构建设置**
   - **Framework preset**: Vite
   - **Build command**: `pnpm install && pnpm build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (留空)
   - ⚠️ **重要**: 如果 Cloudflare 自动检测到 npm，需要在构建命令前添加 `corepack enable && corepack prepare pnpm@latest --activate &&` 或使用 `npm install -g pnpm && pnpm install && pnpm build`

4. **配置环境变量**
   - 在 "Environment variables" 部分添加：
     - 变量名: `GEMINI_API_KEY`
     - 值: `AIzaSyCoPCzFWQZ8-MS3K_KlNMXz7WEQhRpJkAE`（你的 Gemini API Key）
   - 确保同时为 "Production" 和 "Preview" 环境设置
   - ⚠️ **重要**: 环境变量会在部署后生效，请确保正确设置

5. **保存并部署**
   - 点击 "Save and Deploy"
   - Cloudflare 会自动构建并部署你的项目

### 方法二：通过 Wrangler CLI

1. **安装 Wrangler**
   ```bash
   pnpm add -D wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   pnpm wrangler login
   ```

3. **构建项目**
   ```bash
   pnpm build
   ```

4. **部署到 Cloudflare Pages**
   ```bash
   pnpm wrangler pages deploy dist --project-name=global-exchanges
   ```

5. **设置环境变量**
   ```bash
   pnpm wrangler pages secret put GEMINI_API_KEY
   ```
   然后输入你的 Gemini API Key: `AIzaSyCoPCzFWQZ8-MS3K_KlNMXz7WEQhRpJkAE`

## 项目结构说明

```
global-exchanges/
├── functions/              # Cloudflare Functions
│   └── api/
│       └── exchange-details.ts  # Gemini API 代理
├── public/                 # 静态资源
│   └── _redirects         # SPA 路由重定向
├── dist/                  # 构建输出（自动生成）
├── wrangler.toml          # Cloudflare 配置
└── vite.config.ts         # Vite 配置
```

## 环境变量

### 必需变量

- `GEMINI_API_KEY`: Google Gemini API 密钥

### 在 Cloudflare Pages 中设置

1. 进入项目设置
2. 选择 "Settings" → "Environment variables"
3. 添加变量并保存

## 自定义域名

1. 在 Cloudflare Pages 项目设置中
2. 选择 "Custom domains"
3. 添加你的域名
4. Cloudflare 会自动配置 DNS

## 故障排查

### 构建失败

- 检查 `package.json` 中的依赖是否正确
- 确保 Node.js 版本 >= 18
- 查看 Cloudflare 构建日志

### API 调用失败

- 确认 `GEMINI_API_KEY` 环境变量已正确设置
- 检查 Cloudflare Functions 日志
- 验证 API 路由 `/api/exchange-details` 是否正常工作

### 路由问题

- 确保 `public/_redirects` 文件存在
- 检查 SPA 路由是否正确配置

## 本地测试

### 使用 Wrangler 本地测试（推荐）

在部署前，可以使用 Wrangler 在本地测试 Cloudflare Functions：

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 本地预览（使用 .env 文件中的环境变量）
pnpm wrangler pages dev dist
```

### 仅测试前端（不包含 API）

如果只想测试前端界面（API 调用会失败，但可以查看 UI）：

```bash
pnpm dev
```

注意：本地开发时，`.env` 文件已包含你的 API key，但前端代码会尝试调用 `/api/exchange-details`，这需要 Cloudflare Functions 环境。使用 `wrangler pages dev` 可以模拟完整的 Cloudflare Pages 环境。

## 持续部署

一旦连接到 GitHub，每次推送到 `main` 分支都会自动触发部署。

- **Production**: 从 `main` 分支自动部署
- **Preview**: 从其他分支和 PR 自动创建预览部署

## 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Functions 文档](https://developers.cloudflare.com/pages/platform/functions/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

