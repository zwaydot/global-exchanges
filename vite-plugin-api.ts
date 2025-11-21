import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Vite 插件：在本地开发时模拟 Cloudflare Functions API
 * 这样可以使用 pnpm dev 进行本地开发，而不需要 wrangler
 */
export function apiProxy(): Plugin {
  return {
    name: 'api-proxy',
    configureServer(server) {
      console.log('[API Proxy] Plugin loaded, setting up middleware...');
      
      // 加载环境变量
      // loadEnv 默认只加载 VITE_ 开头的变量，所以需要传入空字符串作为前缀来加载所有变量
      const env = loadEnv('development', process.cwd(), '');
      // 也检查 process.env，因为 .env 文件可能没有被 loadEnv 加载
      const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      
      // 如果还是没有，尝试直接从 .env 文件读取（作为后备方案）
      let finalApiKey = apiKey;
      if (!finalApiKey) {
        try {
          const envPath = resolve(process.cwd(), '.env');
          if (existsSync(envPath)) {
            const envContent = readFileSync(envPath, 'utf-8');
            const match = envContent.match(/GEMINI_API_KEY=(.+)/);
            if (match) {
              finalApiKey = match[1].trim();
              console.log('[API Proxy] Loaded API key from .env file directly');
            }
          }
        } catch (e) {
          console.error('[API Proxy] Error reading .env file:', e);
        }
      }
      
      if (!finalApiKey) {
        console.error('[API Proxy] ⚠️  GEMINI_API_KEY not found!');
        console.error('[API Proxy] Checked env vars:', Object.keys(env).filter(k => k.includes('GEMINI')));
        console.error('[API Proxy] process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'exists' : 'not found');
        console.error('[API Proxy] Current working directory:', process.cwd());
      } else {
        console.log(`[API Proxy] ✓ API Key loaded (length: ${finalApiKey.length})`);
      }

      // 加载 FMP API Key
      let fmpApiKey = env.FMP_API_KEY || process.env.FMP_API_KEY;
      if (!fmpApiKey) {
        try {
          // 尝试从 .dev.vars 读取 (Cloudflare Wrangler format)
          const devVarsPath = resolve(process.cwd(), '.dev.vars');
          if (existsSync(devVarsPath)) {
            const devVarsContent = readFileSync(devVarsPath, 'utf-8');
            const match = devVarsContent.match(/FMP_API_KEY=(.+)/);
            if (match) {
              fmpApiKey = match[1].trim();
              console.log('[API Proxy] Loaded FMP API key from .dev.vars file');
            }
          }
        } catch (e) {
          console.error('[API Proxy] Error reading .dev.vars file:', e);
        }
      }

      if (fmpApiKey) {
        console.log(`[API Proxy] ✓ FMP API Key loaded (length: ${fmpApiKey.length})`);
      } else {
        console.warn('[API Proxy] ⚠️ FMP_API_KEY not found! Market ticker will fail locally.');
      }

      // 注册中间件，处理 API 请求
      server.middlewares.use(async (req, res, next) => {
        // 处理 /api/market-ticker 请求
        if (req.url?.startsWith('/api/market-ticker')) {
          console.log(`[API Proxy] Received ${req.method} request to ${req.url}`);
          
          if (req.method !== 'GET') {
            return next();
          }

          try {
            if (!fmpApiKey) {
              console.error('[API Proxy] FMP_API_KEY not configured');
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'FMP_API_KEY not configured' }));
              return;
            }

            const SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'XOM'];
            const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

            const results: any[] = [];

            for (const symbol of SYMBOLS) {
              const url = `${FMP_BASE_URL}/quote?symbol=${symbol}&apikey=${fmpApiKey}`;
              console.log(`[API Proxy] Fetching: ${url.replace(fmpApiKey, '***')}`);

              const response = await fetch(url);

              if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API Proxy] FMP API error status (${symbol}): ${response.status}`);
                console.error(`[API Proxy] FMP API error body (${symbol}): ${errorText}`);
                continue;
              }

              const data = await response.json();
              const item = Array.isArray(data) ? data[0] : null;
              if (!item) continue;

              results.push({
                symbol: item.symbol,
                price: item.price,
                change: item.change,
                changesPercentage: item.changesPercentage || item.changePercentage || 0
              });
            }

            if (results.length === 0) {
              console.warn('[API Proxy] API failed for all symbols, returning mock data');
              const mockData = [
                { symbol: 'SPY', price: 595.00, change: 1.50, changesPercentage: 0.25 },
                { symbol: 'QQQ', price: 505.00, change: 2.00, changesPercentage: 0.40 },
                { symbol: 'AAPL', price: 230.00, change: 1.00, changesPercentage: 0.44 }
              ];
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(mockData));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
            return;

          } catch (error) {
            console.error('[API Proxy] Error fetching market ticker:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch market data' }));
            return;
          }
        }

        // 处理 /api/exchange-details 路径
        if (!req.url?.startsWith('/api/exchange-details')) {
          return next();
        }
        
        console.log(`[API Proxy] Received ${req.method} request to ${req.url}`);
        
        // 只处理 GET 请求
        if (req.method !== 'GET') {
          console.log(`[API Proxy] Ignoring ${req.method} request`);
          return next();
        }

        try {
          // 获取查询参数
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const exchangeName = url.searchParams.get('name');

          if (!exchangeName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Exchange name is required' }));
            return;
          }

          if (!finalApiKey) {
            console.error('[API Proxy] GEMINI_API_KEY not found in environment variables');
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }));
            return;
          }

          console.log(`[API Proxy] Fetching details for: ${exchangeName}`);
          console.log(`[API Proxy] API Key (first 10 chars): ${finalApiKey?.substring(0, 10)}...`);
          console.log(`[API Proxy] API Key length: ${finalApiKey?.length}`);

          // 调用 Gemini API
          const model = "gemini-2.5-flash";
          // 使用请求头方式传递 API key（更安全）
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
          
          const prompt = `
            Provide a detailed but concise summary for the ${exchangeName}. 
            Focus on its history, its global significance, and the types of companies listed.
            Also provide 3-4 bullet point 'key facts' and typical trading hours.
          `;

          const requestBody = {
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                    description: "A 2-3 sentence summary of the exchange history and importance."
                  },
                  keyFacts: {
                    type: "array",
                    items: {
                      type: "string"
                    },
                    description: "Array of 3-4 interesting short facts."
                  },
                  tradingHours: {
                    type: "string",
                    description: "Typical local trading hours (e.g. 09:30 - 16:00)."
                  }
                },
                required: ["description", "keyFacts", "tradingHours"]
              }
            }
          };

          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': finalApiKey,
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API Proxy] Gemini API error (${response.status}):`, errorText);
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          console.log('[API Proxy] Gemini API response received');
          
          // 提取响应文本
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            console.error('[API Proxy] No text in Gemini response:', JSON.stringify(result, null, 2));
            throw new Error("No response from Gemini");
          }

          const data = JSON.parse(text);

          // 返回响应
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify(data));

        } catch (error) {
          console.error("[API Proxy] Error:", error);
          if (error instanceof Error) {
            console.error("[API Proxy] Error message:", error.message);
            console.error("[API Proxy] Error stack:", error.stack);
          }
          
          // 返回错误响应
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({
            description: "Unable to load details at this time. Please try again later.",
            keyFacts: ["Data unavailable"],
            tradingHours: "--:--"
          }));
        }
      });
      
      console.log('[API Proxy] ✓ Middleware registered for /api/exchange-details');
    },
  };
}

