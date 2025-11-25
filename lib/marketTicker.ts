/**
 * Market Ticker 数据刷新逻辑
 * 可被 API endpoint 和 Cron worker 共用
 */

interface TickerResult {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
}

interface CachePayload {
  timestamp: number;
  data: TickerResult[];
}

const CACHE_KEY = 'market-ticker-cache:v1';
// FMP 免费计划只提供 End of Day 数据，由 Cron 每天刷新一次
// 设置 48 小时 TTL 作为保险：如果 Cron 连续两天失败，用户访问时会触发刷新
const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

// 股票列表 - 核心指数和龙头股
const SYMBOLS = ['SPY', 'QQQ', 'VWO', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA'];
const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

/**
 * 从 KV 读取缓存的 ticker 数据
 */
export async function readTickerCache(kv: KVNamespace): Promise<CachePayload | null> {
  try {
    const cached = await kv.get(CACHE_KEY, 'json') as CachePayload | null;
    return cached;
  } catch (err) {
    console.error('[MarketTicker] Failed to read KV cache:', err);
    return null;
  }
}

/**
 * 写入 ticker 数据到 KV 缓存
 */
export async function writeTickerCache(payload: CachePayload, kv: KVNamespace): Promise<void> {
  try {
    await kv.put(CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[MarketTicker] Failed to write KV cache:', err);
  }
}

/**
 * 检查缓存是否新鲜
 */
export function isTickerCacheFresh(payload: CachePayload | null, now: number = Date.now()): boolean {
  if (!payload) return false;
  return now - payload.timestamp < CACHE_TTL_MS;
}

/**
 * 从 FMP API 获取最新的 ticker 数据
 * @returns 获取的数据数组，如果全部失败则返回空数组
 */
export async function fetchTickerFromFMP(apiKey: string): Promise<{
  data: TickerResult[];
  rateLimited: boolean;
}> {
  const results: TickerResult[] = [];
  let rateLimited = false;

  for (const symbol of SYMBOLS) {
    try {
      const response = await fetch(`${FMP_BASE_URL}/quote?symbol=${symbol}&apikey=${apiKey}`);
      
      if (response.status === 429) {
        rateLimited = true;
        console.warn(`[MarketTicker] Rate limit reached when fetching ${symbol}`);
        break;
      }

      if (!response.ok) {
        console.error(`[MarketTicker] FMP API error (${symbol}): ${response.status}`);
        continue;
      }

      const data = await response.json();
      const item = Array.isArray(data) ? data[0] : null;
      if (!item) {
        console.warn(`[MarketTicker] No data returned for ${symbol}`);
        continue;
      }

      results.push({
        symbol: item.symbol,
        price: item.price,
        change: item.change,
        changesPercentage: item.changesPercentage || item.changePercentage || 0
      });

    } catch (err) {
      console.error(`[MarketTicker] Error fetching ${symbol}:`, err);
    }

    // 避免命中免费 plan 的速率限制
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  return { data: results, rateLimited };
}

/**
 * 刷新 Market Ticker 缓存
 * 由 Cron Worker 调用，主动更新数据
 * 
 * @param kv - KV namespace
 * @param apiKey - FMP API key
 * @returns 更新后的数据，如果失败则返回 null
 */
export async function refreshMarketTicker(
  kv: KVNamespace,
  apiKey: string
): Promise<CachePayload | null> {
  console.log('[MarketTicker] Cron triggered, refreshing ticker cache...');

  const { data, rateLimited } = await fetchTickerFromFMP(apiKey);

  if (rateLimited) {
    console.warn('[MarketTicker] Rate limited during cron refresh, keeping existing cache');
    return null;
  }

  if (data.length === 0) {
    console.error('[MarketTicker] No data fetched during cron refresh');
    return null;
  }

  const payload: CachePayload = {
    timestamp: Date.now(),
    data
  };

  await writeTickerCache(payload, kv);
  console.log(`[MarketTicker] Cron refresh successful, cached ${data.length} tickers`);

  return payload;
}

export { CACHE_KEY, CACHE_TTL_MS, SYMBOLS, FMP_BASE_URL };
export type { TickerResult, CachePayload };

