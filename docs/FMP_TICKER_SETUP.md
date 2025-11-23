# FMP Ticker 数据配置指南

## 问题诊断

如果网站显示的是 fallback 数据而不是实时 FMP 数据，请按以下步骤检查：

### 1. 检查 Cloudflare Pages 环境变量

在 Cloudflare Pages 控制台中，确保已配置 `FMP_API_KEY` 环境变量：

1. 进入 Cloudflare Dashboard
2. 选择你的 Pages 项目（`global-exchanges`）
3. 进入 **Settings** → **Environment variables**
4. 检查是否有 `FMP_API_KEY`（对 staging 和 production 环境都要配置）

### 2. 验证 KV 中是否有数据

```bash
# 检查 KV 中是否有 ticker 缓存
npx wrangler kv:key get "market-ticker-cache:v1" \
  --namespace-id=f47995f0fdb143a4b76d073f969e5708
```

如果返回 404，说明 KV 中没有数据。

### 3. 测试 API 端点

**注意**：如果 staging/production 环境配置了 Cloudflare Access，API 端点可能被保护，需要通过浏览器访问。

```bash
# 测试 staging 环境（如果被 Cloudflare Access 保护，会返回 302 重定向）
curl -v "https://staging.deepstock.pro/api/market-ticker"

# 或者通过浏览器访问（会自动处理认证）：
# https://staging.deepstock.pro/api/market-ticker

# 检查响应头中的 X-Cache-Status：
# - fresh: 使用新鲜缓存
# - stale-*: 使用过期缓存（但至少有效）
# - 如果没有这个头，说明返回了错误或需要认证
```

**如果遇到 302 重定向**：
- 说明 Cloudflare Access 已启用
- 需要通过浏览器访问并登录
- 或者在 Cloudflare Access 中配置允许 API 端点访问

### 4. 查看 Cloudflare 日志

在 Cloudflare Dashboard → Workers & Pages → Logs 中查看：
- `[Market Ticker API]` 开头的日志
- 检查是否有 `FMP_API_KEY not configured` 错误
- 检查是否有 FMP API 调用失败的错误

### 5. 手动触发数据刷新

访问 API 端点会自动触发数据刷新（如果缓存过期）：
```bash
curl "https://staging.deepstock.pro/api/market-ticker"
```

## 数据流程

1. **前端请求** → `/api/market-ticker`
2. **检查 KV 缓存** → `market-ticker-cache:v1`
   - 如果缓存新鲜（< 5 分钟），直接返回
   - 如果缓存过期或不存在，继续下一步
3. **调用 FMP API** → 获取实时数据
4. **写入 KV** → 存储到 `market-ticker-cache:v1`（TTL: 5 分钟）
5. **返回数据** → 前端显示

## 故障排查

### 问题：一直显示 fallback 数据

**可能原因：**
- `FMP_API_KEY` 未配置 → 检查 Cloudflare Pages 环境变量
- FMP API 调用失败 → 查看 Cloudflare 日志
- KV 写入失败 → 检查 KV namespace 绑定

**解决方案：**
1. 确保 `FMP_API_KEY` 已正确配置
2. 检查 FMP API key 是否有效（未过期、未超限）
3. 查看 Cloudflare 日志中的错误信息

### 问题：KV 中有数据但前端仍显示 fallback

**可能原因：**
- 前端 API 调用失败（网络问题、CORS 等）
- 前端错误处理逻辑问题

**解决方案：**
1. 打开浏览器开发者工具 → Network 标签
2. 检查 `/api/market-ticker` 请求的状态码
3. 查看响应内容，确认是否返回了有效数据

## 缓存策略

- **缓存 TTL**: 5 分钟
- **KV Key**: `market-ticker-cache:v1`
- **缓存结构**:
  ```json
  {
    "timestamp": 1234567890,
    "data": [
      {
        "symbol": "SPY",
        "price": 652.53,
        "change": -9.92,
        "changesPercentage": -1.52
      },
      ...
    ]
  }
  ```

## 监控建议

建议在 Cloudflare Dashboard 中设置告警：
- 当 `[Market Ticker API]` 日志中出现 `FMP_API_KEY not configured` 时
- 当 API 返回 500 错误时
- 当 FMP API 返回 429（rate limit）时

