# FMP Rate Limit 处理指南

## 当前情况

API 返回错误：
```json
{"error":"Rate limited by FMP. Please wait before retrying."}
```

这说明：
1. ✅ API 端点可以访问（通过了 Cloudflare Access）
2. ❌ FMP API 返回了 429 rate limit
3. ❌ KV 中没有缓存数据，无法返回 fallback

## 问题分析

### 为什么没有缓存数据？

1. **首次调用失败**：如果第一次调用时遇到 rate limit，KV 中不会有数据
2. **TTL 过期**：之前修复前，KV 的 TTL 是 5 分钟，如果过期后新请求失败，数据会丢失
3. **从未成功写入**：如果所有 API 调用都失败，KV 中永远不会有数据

### 当前代码逻辑

当遇到 rate limit 时：
- 如果 KV 中有缓存数据（即使过期），会返回缓存数据
- 如果 KV 中没有缓存数据，返回 429 错误

## 解决方案

### 方案 1: 等待 rate limit 解除后重试（推荐）

1. **等待一段时间**（通常 FMP 的 rate limit 是每分钟或每小时重置）
2. **再次访问 API**：
   ```
   https://staging.deepstock.pro/api/market-ticker
   ```
3. **如果成功**，KV 中会有数据，之后即使遇到 rate limit 也能返回缓存

### 方案 2: 检查 FMP API Key 使用情况

根据图片显示，FMP Dashboard 显示：
- **API calls per day**: 525 / 250（已超出限制！）

这说明：
- 免费 plan 的每日限制是 250 次调用
- 当前已使用 525 次，超出限制

**解决方案**：
1. 等待到第二天重置（通常是 UTC 0:00）
2. 或者升级到付费 plan
3. 或者减少 API 调用频率

### 方案 3: 优化 API 调用策略

当前代码每次请求会调用 10 个 symbol，每个 symbol 间隔 250ms：
- 总耗时：约 2.5 秒
- 每次请求消耗：10 次 API 调用

**优化建议**：
1. 减少 symbol 数量（从 10 个减少到 5-7 个核心 symbol）
2. 增加缓存时间（从 5 分钟增加到 15-30 分钟）
3. 实现更智能的刷新策略（只在缓存过期时刷新）

## 临时解决方案

### 手动写入测试数据到 KV

如果需要立即测试，可以手动写入一些测试数据：

```bash
# 创建测试数据文件
cat > test-ticker-data.json << 'EOF'
{
  "timestamp": 1732345200000,
  "data": [
    {"symbol": "SPY", "price": 652.53, "change": -9.92, "changesPercentage": -1.52},
    {"symbol": "QQQ", "price": 585.67, "change": -13.88, "changesPercentage": -2.37},
    {"symbol": "AAPL", "price": 268.14, "change": 1.89, "changesPercentage": 0.71},
    {"symbol": "MSFT", "price": 472.13, "change": -6.30, "changesPercentage": -1.32},
    {"symbol": "NVDA", "price": 177.30, "change": -3.34, "changesPercentage": -1.85}
  ]
}
EOF

# 写入 KV
npx wrangler kv:key put "market-ticker-cache:v1" \
  --path=test-ticker-data.json \
  --namespace-id=f47995f0fdb143a4b76d073f969e5708
```

**注意**：这只是测试数据，不是实时数据。

## 长期解决方案

### 1. 实现更智能的缓存策略

```typescript
// 建议：只在缓存过期且不在 rate limit 时刷新
if (isCacheFresh(cached, now)) {
  return cached; // 使用新鲜缓存
}

if (rateLimited && cached) {
  return cached; // 即使过期，也返回缓存（总比没有好）
}

// 只有在有配额时才刷新
if (!rateLimited) {
  // 刷新数据
}
```

### 2. 减少 API 调用

- 减少 symbol 数量
- 增加缓存时间
- 实现批量请求（如果 FMP 支持）

### 3. 监控和告警

- 监控 FMP API 调用次数
- 当接近限制时发出告警
- 自动切换到 fallback 模式

## 验证步骤

1. **检查 KV 数据**：
   ```bash
   npx wrangler kv:key get "market-ticker-cache:v1" \
     --namespace-id=f47995f0fdb143a4b76d073f969e5708
   ```

2. **等待 rate limit 重置**（通常是 UTC 0:00）

3. **再次访问 API**：
   ```
   https://staging.deepstock.pro/api/market-ticker
   ```

4. **检查响应**：
   - 如果成功，应该返回 ticker 数据数组
   - 响应头中应该有 `X-Cache-Status: fresh`

## 当前状态

- ✅ API 端点可访问
- ✅ 代码逻辑正确（会返回缓存数据如果存在）
- ❌ FMP rate limit 已超出（525/250）
- ❌ KV 中没有缓存数据（首次调用失败）

**下一步**：等待 FMP rate limit 重置后，再次访问 API，成功后会写入 KV，之后即使遇到 rate limit 也能返回缓存数据。

