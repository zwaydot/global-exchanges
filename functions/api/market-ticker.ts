import {
  readTickerCache,
  writeTickerCache,
  isTickerCacheFresh,
  fetchTickerFromFMP,
  type CachePayload
} from '../../lib/marketTicker';

type EnvBindings = {
  FMP_API_KEY?: string;
  MARKET_DATA_CACHE?: KVNamespace;
};

// 内存缓存作为 KV 不可用时的备用
let memoryCache: CachePayload | null = null;

const readCache = async (kv?: KVNamespace): Promise<CachePayload | null> => {
  if (kv) {
    return readTickerCache(kv);
  }
  return memoryCache;
};

const writeCache = async (payload: CachePayload, kv?: KVNamespace) => {
  if (kv) {
    await writeTickerCache(payload, kv);
  }
  memoryCache = payload;
};

const isCacheFresh = (payload: CachePayload | null, now: number) => {
  return isTickerCacheFresh(payload, now);
};

export const onRequest: PagesFunction = async (context) => {
  // Handle CORS
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { FMP_API_KEY: apiKey, MARKET_DATA_CACHE: kv } = context.env as EnvBindings;
    
    if (!apiKey) {
      console.error('[Market Ticker API] FMP_API_KEY not configured');
      // If no API key, try to return cached data if available
      const cached = await readCache(kv);
      if (cached && cached.data.length > 0) {
        console.warn('[Market Ticker API] FMP_API_KEY not configured, serving stale cache');
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60',
            'X-Cache-Status': 'stale-no-key'
          },
        });
      }
      return new Response(
        JSON.stringify({ error: 'Server configuration error: FMP_API_KEY not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 仅使用免费 plan 白名单中最核心的指数/龙头
    const now = Date.now();
    const cached = await readCache(kv);
    if (isCacheFresh(cached, now)) {
      console.log(`[Market Ticker API] Serving fresh cache (age: ${Math.round((now - cached!.timestamp) / 1000)}s)`);
      return new Response(JSON.stringify(cached!.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60',
          'X-Cache-Status': 'fresh'
        },
      });
    }
    
    console.log(`[Market Ticker API] Cache expired or missing, fetching from FMP (cache age: ${cached ? Math.round((now - cached.timestamp) / 1000) : 'N/A'}s)`);

    // 使用共享的 fetchTickerFromFMP 函数
    const { data: results, rateLimited } = await fetchTickerFromFMP(apiKey);

    if (rateLimited) {
      // 即使缓存过期，也返回缓存数据（总比没有数据好）
      if (cached && cached.data.length > 0) {
        const cacheAge = Math.round((now - cached.timestamp) / 1000);
        console.warn(`[Market Ticker API] Serving cached data due to rate limiting (age: ${cacheAge}s)`);
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60',
            'X-Cache-Status': 'stale-rate-limited',
            'X-Cache-Age': String(cacheAge)
          },
        });
      }
      console.error('[Market Ticker API] Rate limited and no cache available');
      return new Response(
        JSON.stringify({ 
          error: 'Rate limited by FMP. Please wait before retrying.',
          message: 'No cached data available. The first successful API call will populate the cache.'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (results.length === 0) {
      if (cached && cached.data.length > 0) {
        console.warn('[Market Ticker API] Using cached ticker data due to fetch failures (0 results)');
        // 不写入 KV，因为数据没有更新，只是使用旧数据
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60',
            'X-Cache-Status': 'stale-fetch-failed'
          },
        });
      }
      console.error('[Market Ticker API] No market data fetched and no cache available');
      throw new Error('No market data fetched');
    }

    const payload: CachePayload = { timestamp: now, data: results };
    await writeCache(payload, kv);
    console.log(`[Market Ticker API] Successfully fetched and cached ${results.length} tickers`);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
        'X-Cache-Status': 'fresh'
      },
    });

  } catch (error) {
    console.error('[Market Ticker API] Error:', error);
    // Try to return cached data even on error (even if expired)
    try {
      const { MARKET_DATA_CACHE: kv } = context.env as EnvBindings;
      const cached = await readCache(kv);
      if (cached && cached.data.length > 0) {
        const now = Date.now();
        const cacheAge = Math.round((now - cached.timestamp) / 1000);
        console.warn(`[Market Ticker API] Error occurred, serving stale cache as fallback (age: ${cacheAge}s)`);
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60',
            'X-Cache-Status': 'stale-error-fallback',
            'X-Cache-Age': String(cacheAge)
          },
        });
      }
    } catch (cacheError) {
      console.error('[Market Ticker API] Failed to read cache on error:', cacheError);
    }
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch market data', 
        details: error instanceof Error ? error.message : String(error),
        message: 'No cached data available. Please wait for the next successful API call to populate the cache.'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};


