# Cloudflare Access API 访问配置

## 问题

如果 staging/production 环境配置了 Cloudflare Access，API 端点可能被保护，导致：
- `curl` 请求返回 302 重定向到登录页面
- 无法直接测试 API 端点

## 解决方案

### 方案 1: 在 Cloudflare Access 中配置允许 API 路径（推荐）

1. 进入 Cloudflare Dashboard
2. 选择 **Zero Trust** → **Access** → **Applications**
3. 找到你的应用（`staging.deepstock.pro` 或 `deepstock.pro`）
4. 编辑应用配置
5. 在 **Policies** 中添加新规则：
   - **Rule name**: `Allow API endpoints`
   - **Action**: `Allow`
   - **Include**:
     - **Path**: `/api/*`
   - **Require**: 可以选择 `Email` 或 `Service Token`（推荐 Service Token 用于自动化）

### 方案 2: 使用 Service Token（用于自动化测试）

1. 进入 Cloudflare Dashboard
2. 选择 **Zero Trust** → **Access** → **Service Tokens**
3. 创建新的 Service Token
4. 在 API 请求中使用：
   ```bash
   curl -H "CF-Access-Token: YOUR_SERVICE_TOKEN" \
        "https://staging.deepstock.pro/api/market-ticker"
   ```

### 方案 3: 通过浏览器访问（用于手动测试）

1. 在浏览器中访问：`https://staging.deepstock.pro/api/market-ticker`
2. 完成 Cloudflare Access 认证
3. 查看返回的 JSON 数据

### 方案 4: 使用本地开发环境测试

如果本地开发环境配置了 `wrangler pages dev`，可以直接测试：

```bash
# 构建项目
pnpm run build

# 启动本地 Pages Functions
npx wrangler pages dev dist \
  --kv=MARKET_DATA_CACHE=local \
  --env FMP_API_KEY=your_key_here

# 在另一个终端测试
curl "http://localhost:8788/api/market-ticker"
```

## 验证 API 是否正常工作

即使无法直接 curl，也可以通过以下方式验证：

1. **查看 Cloudflare 日志**：
   - Dashboard → Workers & Pages → Logs
   - 查看 `[Market Ticker API]` 开头的日志
   - 检查是否有成功写入的日志：`Successfully fetched and cached X tickers`

2. **检查 KV 数据**：
   ```bash
   npx wrangler kv:key list --namespace-id=f47995f0fdb143a4b76d073f969e5708
   ```
   应该能看到 `market-ticker-cache:v1`

3. **前端验证**：
   - 访问网站，查看底部的 ticker 是否显示实时数据
   - 打开浏览器开发者工具 → Network，查看 `/api/market-ticker` 请求
   - 检查响应内容是否包含 ticker 数据

## 推荐配置

对于 API 端点，建议：
- 使用 Service Token 进行自动化访问
- 或者配置允许 `/api/*` 路径无需认证（如果 API 是公开的）
- 保持其他路径的 Cloudflare Access 保护

