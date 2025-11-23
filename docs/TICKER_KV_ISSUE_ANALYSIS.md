# FMP Ticker KV 存储问题分析

## 问题现象

KV 中只有 `exchange-stats:v1`（WFE 数据），没有 `market-ticker-cache:v1`（FMP ticker 数据）。

## 代码逻辑分析

### 写入 KV 的条件

查看 `functions/api/market-ticker.ts` 第 200-201 行：

```typescript
const payload: CachePayload = { timestamp: now, data: results };
await writeCache(payload, kv);
```

**关键发现**：只有当 `results.length > 0` 时才会执行到这里，即必须成功获取到至少一个 ticker 数据。

### 不写入 KV 的情况

1. **Rate Limited 且无缓存**（第 157-180 行）：
   - 如果遇到 rate limit 且 KV 中没有缓存，直接返回 429 错误
   - **不会写入 KV**

2. **获取失败且无缓存**（第 183-198 行）：
   - 如果 `results.length === 0` 且 KV 中没有缓存，抛出错误
   - **不会写入 KV**

3. **FMP_API_KEY 未配置**（第 69-94 行）：
   - 如果没有 API key 且 KV 中没有缓存，返回 500 错误
   - **不会写入 KV**

### TTL 过期问题

查看 `writeCache` 函数（第 35-46 行）：

```typescript
await kv.put(CACHE_KEY, JSON.stringify(payload), {
  expirationTtl: Math.ceil(CACHE_TTL_MS / 1000)  // 5 分钟
});
```

**问题**：
- KV 的 TTL 设置为 5 分钟
- 如果 5 分钟内没有成功获取新数据，KV 中的数据就会过期被删除
- 如果第一次调用就失败，KV 中永远不会有数据

## 根本原因

1. **首次调用失败**：如果第一次调用 `/api/market-ticker` 时：
   - FMP API key 未配置
   - 或遇到 rate limit
   - 或网络错误
   - 或所有 symbol 都获取失败
   
   那么 KV 中就不会有任何数据。

2. **TTL 过期后无法恢复**：即使之前成功写入过数据，如果：
   - 5 分钟后缓存过期
   - 新请求失败（rate limit、API key 问题等）
   - KV 中的数据会被删除，且无法恢复（因为没有新数据写入）

3. **没有持久化机制**：与 WFE 数据不同，ticker 数据没有：
   - 定时任务自动刷新
   - 持久化存储（TTL 太短）
   - 失败重试机制

## 解决方案

### 方案 1: 移除 TTL，手动管理过期（推荐）

```typescript
const writeCache = async (payload: CachePayload, kv?: KVNamespace) => {
  if (kv) {
    try {
      // 移除 expirationTtl，让数据持久化
      await kv.put(CACHE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('[Market Ticker API] Failed to write KV cache:', err);
    }
  }
  memoryCache = payload;
};
```

**优点**：
- 数据不会因为 TTL 过期而丢失
- 即使 API 失败，仍能使用旧数据
- 简单直接

**缺点**：
- 需要手动检查数据新鲜度（代码中已有 `isCacheFresh` 检查）

### 方案 2: 增加 TTL 时间

将 TTL 从 5 分钟增加到 24 小时或更长：

```typescript
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 小时
```

**优点**：
- 数据保留时间更长
- 减少因过期导致的数据丢失

**缺点**：
- 数据可能不够新鲜
- 仍然可能因为过期而丢失

### 方案 3: 失败时保留旧数据

在写入失败时，不删除旧数据：

```typescript
if (results.length === 0) {
  if (cached && cached.data.length > 0) {
    // 即使获取失败，也更新 timestamp 以延长 TTL
    const stalePayload: CachePayload = { 
      timestamp: now,  // 更新 timestamp
      data: cached.data 
    };
    await writeCache(stalePayload, kv);  // 写入以延长 TTL
    return new Response(JSON.stringify(cached.data), {...});
  }
  throw new Error('No market data fetched');
}
```

**优点**：
- 保留旧数据，避免完全丢失
- 延长 TTL，给后续请求更多机会

**缺点**：
- 逻辑更复杂
- 可能返回过时的数据

## 推荐方案

**推荐使用方案 1**，因为：
1. 代码中已有 `isCacheFresh` 检查，可以判断数据是否新鲜
2. TTL 主要是为了自动清理，但我们可以通过代码逻辑控制
3. 数据持久化更重要，避免因 API 失败导致完全无法使用

## 验证步骤

1. 检查 Cloudflare Pages 环境变量中是否配置了 `FMP_API_KEY`
2. 查看 Cloudflare 日志，检查是否有错误：
   - `FMP_API_KEY not configured`
   - `Rate limit reached`
   - `No market data fetched`
3. 手动调用 API 测试：
   ```bash
   curl -v "https://staging.deepstock.pro/api/market-ticker"
   ```
4. 检查响应头中的 `X-Cache-Status`，了解缓存状态

