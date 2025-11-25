import { refreshExchangeStats } from '../lib/exchangeStats';
import { refreshMarketTicker } from '../lib/marketTicker';

interface Env {
  MARKET_DATA_CACHE: KVNamespace;
  FMP_API_KEY?: string;
}

/**
 * 刷新交易所统计数据 (WFE 数据，每月更新一次)
 */
async function refreshExchangeStatsJob(env: Env): Promise<void> {
  try {
    await refreshExchangeStats(env.MARKET_DATA_CACHE);
    console.log('[Cron] Successfully refreshed exchange stats cache');
  } catch (error) {
    console.error('[Cron] Failed to refresh exchange stats cache:', error);
    throw error;
  }
}

/**
 * 刷新 Market Ticker 数据 (FMP EOD 股票价格，每天更新一次)
 */
async function refreshMarketTickerJob(env: Env): Promise<void> {
  if (!env.FMP_API_KEY) {
    console.error('[Cron] FMP_API_KEY not configured, skipping ticker refresh');
    return;
  }

  try {
    const result = await refreshMarketTicker(env.MARKET_DATA_CACHE, env.FMP_API_KEY);
    if (result) {
      console.log(`[Cron] Successfully refreshed market ticker (${result.data.length} symbols)`);
    } else {
      console.warn('[Cron] Market ticker refresh returned null (rate limited or no data)');
    }
  } catch (error) {
    console.error('[Cron] Failed to refresh market ticker:', error);
    // 不抛出错误，让其他任务继续执行
  }
}

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const cronPattern = event.cron;
    
    // 根据不同的 cron 触发不同的任务
    // "0 22 * * *" - 每天 UTC 22:00：刷新 Market Ticker (FMP EOD 数据)
    // "0 6 2 * *"  - 每月 2 日 6:00：刷新 Exchange Stats (WFE 统计)
    if (cronPattern === '0 22 * * *') {
      ctx.waitUntil(refreshMarketTickerJob(env));
    } else if (cronPattern === '0 6 2 * *') {
      ctx.waitUntil(refreshExchangeStatsJob(env));
    } else {
      // 默认都执行（兼容旧配置或手动触发）
      ctx.waitUntil(Promise.all([
        refreshMarketTickerJob(env),
        refreshExchangeStatsJob(env),
      ]));
    }
  },
};

