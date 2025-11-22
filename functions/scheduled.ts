import { refreshExchangeStats } from '../lib/exchangeStats';

export const onSchedule: PagesFunction<{ MARKET_TICKER_CACHE: KVNamespace }> = async (context) => {
  try {
    await refreshExchangeStats(context.env.MARKET_TICKER_CACHE);
  } catch (error) {
    console.error('[ExchangeStats] Scheduled refresh failed', error);
  }
};

