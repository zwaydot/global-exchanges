import { refreshExchangeStats } from '../lib/exchangeStats';

interface Env {
  MARKET_DATA_CACHE: KVNamespace;
}

async function runScheduledJob(env: Env): Promise<void> {
  try {
    await refreshExchangeStats(env.MARKET_DATA_CACHE);
    console.log('exchange-cron: successfully refreshed market ticker cache');
  } catch (error) {
    console.error('exchange-cron: failed to refresh market ticker cache', error);
    throw error;
  }
}

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledJob(env));
  },
};

