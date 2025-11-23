import { getStoredExchangeStats, refreshExchangeStats, StoredExchangeStats } from '../../lib/exchangeStats';

const STALE_MS = 1000 * 60 * 60 * 24 * 35; // 35 days

export const onRequest: PagesFunction<{ MARKET_DATA_CACHE: KVNamespace }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const exchangeId = url.searchParams.get('exchangeId') ?? undefined;
  const forceRefresh = url.searchParams.get('force') === '1';

  let snapshot = forceRefresh ? null : await getStoredExchangeStats(env.MARKET_DATA_CACHE);

  if (!snapshot || isStale(snapshot)) {
    try {
      snapshot = await refreshExchangeStats(env.MARKET_DATA_CACHE);
    } catch (error) {
      console.error('[ExchangeStats API] Failed to refresh stats', error);
      // If refresh fails, try to use existing snapshot (if any)
      if (!snapshot) {
        snapshot = await getStoredExchangeStats(env.MARKET_DATA_CACHE);
      }
    }
  }

  // If still no snapshot, return empty response (not an error - will use fallback data)
  if (!snapshot) {
    if (exchangeId) {
      return jsonResponse({
        exchangeId,
        stats: null,
        meta: null,
      });
    }
    return jsonResponse({
      meta: null,
      exchanges: {},
    });
  }

  if (exchangeId) {
    return jsonResponse({
      exchangeId,
      stats: snapshot.data[exchangeId] ?? null,
      meta: buildMeta(snapshot),
    });
  }

  return jsonResponse({
    meta: buildMeta(snapshot),
    exchanges: snapshot.data,
  });
};

function isStale(snapshot: StoredExchangeStats) {
  if (!snapshot?.extractedAt) return true;
  return Date.now() - snapshot.extractedAt > STALE_MS;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function buildMeta(snapshot: StoredExchangeStats) {
  return {
    issueSlug: snapshot.issueSlug,
    issueTitle: snapshot.issueTitle,
    periodLabel: snapshot.periodLabel,
    extractedAt: snapshot.extractedAt,
  };
}

