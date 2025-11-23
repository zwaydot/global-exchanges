interface TickerResult {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
}

type EnvBindings = {
  FMP_API_KEY?: string;
  MARKET_DATA_CACHE?: KVNamespace;
};

interface CachePayload {
  timestamp: number;
  data: TickerResult[];
}

const CACHE_KEY = 'market-ticker-cache:v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let memoryCache: CachePayload | null = null;

const readCache = async (kv?: KVNamespace): Promise<CachePayload | null> => {
  if (kv) {
    try {
      const cached = await kv.get(CACHE_KEY, 'json') as CachePayload | null;
      return cached;
    } catch (err) {
      console.error('[Market Ticker API] Failed to read KV cache:', err);
    }
  }
  return memoryCache;
};

const writeCache = async (payload: CachePayload, kv?: KVNamespace) => {
  if (kv) {
    try {
      await kv.put(CACHE_KEY, JSON.stringify(payload), {
        expirationTtl: Math.ceil(CACHE_TTL_MS / 1000)
      });
    } catch (err) {
      console.error('[Market Ticker API] Failed to write KV cache:', err);
    }
  }
  memoryCache = payload;
};

const isCacheFresh = (payload: CachePayload | null, now: number) => {
  if (!payload) return false;
  return now - payload.timestamp < CACHE_TTL_MS;
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

    const SYMBOLS = ['SPY', 'QQQ', 'VWO', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA'];
    const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

    const results: TickerResult[] = [];
    let rateLimited = false;
    
    for (const symbol of SYMBOLS) {
      try {
        const response = await fetch(`${FMP_BASE_URL}/quote?symbol=${symbol}&apikey=${apiKey}`);
        if (response.status === 429) {
          rateLimited = true;
          console.warn(`[Market Ticker API] Rate limit reached when fetching ${symbol}`);
          break;
        }

        if (!response.ok) {
          throw new Error(`FMP API error (${symbol}): ${response.status}`);
        }
        
        const data = await response.json();
        const item = Array.isArray(data) ? data[0] : null;
        if (!item) {
          console.warn(`[Market Ticker API] No data returned for ${symbol}`);
          continue;
        }

        const formatted: TickerResult = {
          symbol: item.symbol,
          price: item.price,
          change: item.change,
          changesPercentage: item.changesPercentage || item.changePercentage || 0
        };

        results.push(formatted);
      } catch (err) {
        console.error(`[Market Ticker API] Error fetching ${symbol}:`, err);
      }

      // 避免命中免费 plan 的速率限制
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    if (rateLimited) {
      if (cached && cached.data.length > 0) {
        console.warn('[Market Ticker API] Serving cached data due to rate limiting');
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60',
            'X-Cache-Status': 'stale-rate-limited'
          },
        });
      }
      console.error('[Market Ticker API] Rate limited and no cache available');
      return new Response(
        JSON.stringify({ error: 'Rate limited by FMP. Please wait before retrying.' }),
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
    // Try to return cached data even on error
    try {
      const { MARKET_DATA_CACHE: kv } = context.env as EnvBindings;
      const cached = await readCache(kv);
      if (cached && cached.data.length > 0) {
        console.warn('[Market Ticker API] Error occurred, serving stale cache as fallback');
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60',
            'X-Cache-Status': 'stale-error-fallback'
          },
        });
      }
    } catch (cacheError) {
      console.error('[Market Ticker API] Failed to read cache on error:', cacheError);
    }
    return new Response(
      JSON.stringify({ error: 'Failed to fetch market data', details: error instanceof Error ? error.message : String(error) }),
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


