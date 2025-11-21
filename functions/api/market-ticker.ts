interface TickerResult {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
}

let cachedTickerData: { timestamp: number; data: TickerResult[] } = {
  timestamp: 0,
  data: []
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
    const apiKey = context.env.FMP_API_KEY;
    
    if (!apiKey) {
      console.error('[Market Ticker API] FMP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
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
    if (now - cachedTickerData.timestamp < 60_000 && cachedTickerData.data.length > 0) {
      return new Response(JSON.stringify(cachedTickerData.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=30'
        },
      });
    }

    const SYMBOLS = ['SPY', 'QQQ', 'SPYG', 'VWO', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'JPM', 'XOM'];
    const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

    const results: TickerResult[] = [];
    
    for (const symbol of SYMBOLS) {
      try {
        const response = await fetch(`${FMP_BASE_URL}/quote?symbol=${symbol}&apikey=${apiKey}`);
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

    if (results.length === 0) {
      if (cachedTickerData.data.length > 0) {
        console.warn('[Market Ticker API] Using cached ticker data due to fetch failures');
        return new Response(JSON.stringify(cachedTickerData.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=30'
          },
        });
      }
      throw new Error('No market data fetched');
    }

    cachedTickerData = { timestamp: now, data: results };

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      },
    });

  } catch (error) {
    console.error('[Market Ticker API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch market data' }),
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


