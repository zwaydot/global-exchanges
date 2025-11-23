# KV Namespace 架构说明

## 当前架构

### 单一 KV Namespace: `MARKET_DATA_CACHE`

**Namespace ID**: `f47995f0fdb143a4b76d073f969e5708`

### 存储的数据

#### 1. FMP Ticker 数据
- **Key**: `market-ticker-cache:v1`
- **更新频率**: 5分钟 TTL（实时数据）
- **数据来源**: Financial Modeling Prep API
- **用途**: 显示实时股票价格（SPY, QQQ, AAPL, MSFT等）
- **数据结构**:
  ```json
  {
    "timestamp": 1234567890,
    "data": [
      {
        "symbol": "SPY",
        "price": 652.53,
        "change": -9.92,
        "changesPercentage": -1.52
      }
    ]
  }
  ```

#### 2. WFE Exchange Stats 数据
- **Key**: `exchange-stats:v1`
- **更新频率**: 每月2号自动更新（35天过期）
- **数据来源**: World Federation of Exchanges (WFE) Focus
- **用途**: 显示全球交易所统计数据（市值、交易量、上市公司数量等）
- **数据结构**:
  ```json
  {
    "version": 1,
    "issueSlug": "december-2025",
    "issueTitle": "Market Statistics - December 2025",
    "periodLabel": "Oct 25",
    "extractedAt": 1763827675147,
    "data": {
      "nyse": {
        "marketCapUSD": 32312995260000,
        "monthlyTradingValueUSD": 4327106000000,
        "listedCompanies": { "total": 2146 }
      }
    }
  }
  ```

## 架构评估

### ✅ 优点
1. **配置简单**: 只需管理一个 KV namespace
2. **成本更低**: Cloudflare 免费 tier 限制 KV namespace 数量
3. **管理集中**: 所有市场数据在一个地方

### ⚠️ 缺点
1. ~~**命名不清晰**: `MARKET_TICKER_CACHE` 暗示只用于 ticker，但实际也存储交易所数据~~ ✅ 已重命名为 `MARKET_DATA_CACHE`
2. **数据性质不同**: 
   - Ticker: 高频实时数据（5分钟）
   - Exchange Stats: 低频月度数据（35天）
3. **扩展性**: 如果未来需要不同的访问权限或配置，会不方便

## 未来改进建议

### 方案 1: 重命名（推荐）
~~将 `MARKET_TICKER_CACHE` 重命名为 `MARKET_DATA_CACHE` 或 `GLOBAL_EXCHANGES_CACHE`~~ ✅ 已完成：重命名为 `MARKET_DATA_CACHE`

**优点**:
- 命名更准确，反映实际用途
- 改动最小（只需重命名 binding）
- 保持单一 namespace 的简单性

**缺点**:
- 需要更新所有引用代码
- 需要在 Cloudflare 中更新 binding 名称（但 namespace ID 不变）

### 方案 2: 分离为两个 namespace
- ~~`MARKET_TICKER_CACHE`: 仅用于 FMP ticker 数据~~ (已重命名为 `MARKET_DATA_CACHE`)
- `EXCHANGE_STATS_CACHE`: 仅用于 WFE exchange stats 数据

**优点**:
- 职责清晰，各司其职
- 可独立配置和扩展
- 更符合单一职责原则

**缺点**:
- 需要创建新的 KV namespace
- 配置更复杂
- 成本略高（但仍在免费 tier 内）

## 当前建议

**保持现状**，因为：
1. 数据量不大（只有两个 key）
2. 更新频率差异不影响存储
3. 功能上完全可行
4. 如果未来需要扩展，再考虑方案 1 或 2

## Key 命名规范

当前使用版本化的 key：
- `market-ticker-cache:v1` - 便于未来升级到 v2
- `exchange-stats:v1` - 便于未来升级到 v2

如果数据结构需要重大变更，可以：
1. 创建新的 key（如 `market-ticker-cache:v2`）
2. 迁移数据
3. 更新代码引用
4. 删除旧 key

