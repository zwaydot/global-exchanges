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

    const SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'XOM'];
    const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

    const results = [];
    
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

        results.push({
          symbol: item.symbol,
          price: item.price,
          change: item.change,
          changesPercentage: item.changesPercentage || item.changePercentage || 0
        });
      } catch (err) {
        console.error(`[Market Ticker API] Error fetching ${symbol}:`, err);
      }
    }

    if (results.length === 0) {
      throw new Error('No market data fetched');
    }

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


