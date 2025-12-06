import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { EXCHANGE_MAPPINGS, DEFAULT_MAPPING } from './lib/exchangeMapping';

const DEV_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedTicker: { timestamp: number; data: any[] } = { timestamp: 0, data: [] };

export function apiProxy(): Plugin {
  return {
    name: 'api-proxy',
    configureServer(server) {
      console.log('[API Proxy] Plugin loaded, setting up middleware...');
      
      const env = loadEnv('development', process.cwd(), '');
      let finalApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      
      if (!finalApiKey) {
        try {
          const envPath = resolve(process.cwd(), '.env');
          if (existsSync(envPath)) {
            const envContent = readFileSync(envPath, 'utf-8');
            const match = envContent.match(/GEMINI_API_KEY=(.+)/);
            if (match) finalApiKey = match[1].trim();
          }
        } catch (e) { console.error('[API Proxy] Error reading .env:', e); }
      }

      let fmpApiKey = env.FMP_API_KEY || process.env.FMP_API_KEY;
      if (!fmpApiKey) {
        try {
          const devVarsPath = resolve(process.cwd(), '.dev.vars');
          if (existsSync(devVarsPath)) {
            const content = readFileSync(devVarsPath, 'utf-8');
            const match = content.match(/FMP_API_KEY=(.+)/);
            if (match) fmpApiKey = match[1].trim();
          }
        } catch (e) { console.error('[API Proxy] Error reading .dev.vars:', e); }
      }

      server.middlewares.use(async (req, res, next) => {
        // 1. /api/market-ticker
        if (req.url?.startsWith('/api/market-ticker')) {
          if (req.method !== 'GET') return next();
          try {
            if (!fmpApiKey) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'FMP_API_KEY not configured' }));
              return;
            }
            const SYMBOLS = ['SPY', 'QQQ', 'SPYG', 'VWO', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'JPM', 'XOM'];
            const now = Date.now();
            if (cachedTicker.timestamp && now - cachedTicker.timestamp < DEV_CACHE_TTL_MS && cachedTicker.data.length > 0) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(cachedTicker.data));
              return;
            }
            const results: any[] = [];
            for (const symbol of SYMBOLS) {
              const r = await fetch(`https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${fmpApiKey}`);
              if (r.ok) {
                const d = await r.json();
                const i = Array.isArray(d) ? d[0] : null;
                if (i) results.push({ symbol: i.symbol, price: i.price, change: i.change, changesPercentage: i.changesPercentage || 0 });
              }
              await new Promise(resolve => setTimeout(resolve, 250));
            }
            if (results.length > 0) cachedTicker = { timestamp: Date.now(), data: results };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results.length > 0 ? results : cachedTicker.data));
            return;
          } catch (e) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to fetch market data' }));
            return;
          }
        }

        // 2. /api/generate-snapshot (Pure REST)
        if (req.url?.startsWith('/api/generate-snapshot')) {
          if (req.method !== 'GET') return next();

          try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
            const exchangeName = url.searchParams.get('exchange');
          if (!exchangeName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Exchange name is required' }));
            return;
          }

            const mapping = EXCHANGE_MAPPINGS[exchangeName] || DEFAULT_MAPPING;

            const fetchWeather = async (lat: number, lon: number) => {
               try {
                 const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,is_day&timezone=auto`);
                 // @ts-ignore
                 const d = await r.json();
                 
                 const code = d.current?.weather_code ?? 0;
                 const isDay = d.current?.is_day ?? 1;
                 const localTime = d.current?.time;
                 
                 let condition = "Clear";
                 if (code === 0) condition = "Clear";
                 else if (code >= 1 && code <= 3) condition = "Cloudy";
                 else if (code >= 45 && code <= 48) condition = "Foggy";
                 else if (code >= 51 && code <= 67) condition = "Raining";
                 else if (code >= 71 && code <= 77) condition = "Snowing";
                 else if (code >= 95) condition = "Thunderstorm";
                 
                 // @ts-ignore
                 return { condition, temp: d.current?.temperature_2m ?? 20, isDay: !!isDay, localTime };
               } catch { return { condition: "Sunny", temp: 20, isDay: true }; }
            };
            
            function getWeatherInstruction(condition: string, isDay: boolean) {
              const lower = condition.toLowerCase();
              
              if (lower.includes('rain') || lower.includes('thunder')) {
                return isDay 
                  ? "Overcast sky, rain falling, wet glossy streets reflecting the grey sky. People with umbrellas."
                  : "Dark stormy sky, rain streaks visible against streetlights, wet glossy pavement reflecting neon city lights. Dramatic noir atmosphere.";
              }
              
              if (lower.includes('snow')) {
                return isDay
                  ? "White overcast sky, fresh white snow covering rooftops and streets. Soft diffuse light."
                  : "Night scene with falling snow visible in streetlights. Snow glows softly in the city lights. Cozy winter atmosphere.";
              }
              
              if (lower.includes('fog')) {
                return isDay
                  ? "Misty atmosphere, buildings fading into the white fog at the top. Soft, mysterious lighting."
                  : "Dense fog glowing from city lights, halos around street lamps. moody and atmospheric.";
              }

              if (lower.includes('cloud')) {
                return isDay
                  ? "Soft diffused daylight, no harsh shadows. Clouds in the sky."
                  : "Cloudy night sky, city lights reflecting off low clouds. Soft ambient city glow.";
              }
              
              // Default: Clear/Sunny
              return isDay
                ? "Bright, warm sunlight creating distinct, sharp shadows. Blue sky."
                : "Clear starry night sky. Cityscape illuminated by warm streetlights and office windows. Contrast between dark sky and bright city.";
            }
            
            const fetchMarketViaGemini = async (indexName: string, sym: string, geminiKey?: string) => {
              if (!geminiKey) return null;
              try {
                const model = 'gemini-flash-latest';
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
                const prompt = `Search for the current real-time price and percentage change of ${indexName} (${sym}). 
                After finding the data, output it in this exact STRICT JSON format (keys must be double-quoted string, no trailing commas, no markdown):
                {"price": 1234.56, "change": 12.34, "changePercent": 0.56}
                If not found, output: {"price": 0, "change": 0, "changePercent": 0}`;
                
                const r = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    tools: [{ googleSearch: {} }]
                  })
                });
                
                if (r.ok) {
                  const json = await r.json();
                  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    try {
                        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                        
                        // Attempt to fix common JSON syntax errors
                        try {
                            const match = cleanText.match(/\{[\s\S]*\}/);
                            if(match) JSON.parse(match[0]); 
                        } catch {
                             const match = cleanText.match(/\{[\s\S]*\}/);
                             if (match) {
                                cleanText = match[0]
                                    .replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3')
                                    .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
                                    .replace(/:\s*'([^']*)'/g, ': "$1"');
                             }
                        }

                        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const data = JSON.parse(jsonMatch[0]);
                            if (typeof data.price === 'number' && data.price > 0) {
                                console.log(`[API Proxy] Gemini fetched ${indexName}:`, data);
                                return { 
                                    price: data.price, 
                                    change: typeof data.change === 'number' ? data.change : 0, 
                                    changePercent: typeof data.changePercent === 'number' ? data.changePercent : 0 
                                };
                            }
                        }
                    } catch (e) { console.warn('Failed to parse Gemini JSON:', e); }
                  }
                }
              } catch (e) {
                console.warn(`[API Proxy] Gemini search failed for ${indexName}:`, e);
              }
              return null;
            };

            const fetchMarket = async (sym: string, indexName: string, geminiKey?: string, fmpKey?: string) => {
              // Try Gemini first (works for all indices)
              if (geminiKey) {
                const geminiData = await fetchMarketViaGemini(indexName, sym, geminiKey);
                if (geminiData && geminiData.price > 0) {
                  return geminiData;
                }
              }
              
              // Fallback to FMP (only for symbols starting with ^)
              if (fmpKey && sym.startsWith('^')) {
                try {
                  const url = `https://financialmodelingprep.com/stable/quote?symbol=${sym}&apikey=${fmpKey}`;
                  const r = await fetch(url);
                  if (r.ok) {
                    const d = await r.json();
                    const i = Array.isArray(d) && d.length > 0 ? d[0] : null;
                    if(i && i.price !== undefined) {
                      return { price: i.price ?? 0, change: i.change ?? 0, changePercent: i.changesPercentage ?? 0 };
                    }
                  }
                } catch (e) {
                  console.warn(`[API Proxy] FMP failed for ${sym}:`, e);
                }
              }
              
              return { price: 0, change: 0, changePercent: 0 };
            };

            // 2. Start Fetching Data (Parallel Optimization)
            const weatherPromise = fetchWeather(mapping.lat, mapping.lon);
            const marketPromise = fetchMarket(mapping.indexSymbol, mapping.indexName, finalApiKey, fmpApiKey);

            // 3. Wait for Weather ONLY
            const weatherData = await weatherPromise;

            const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const weatherDesc = weatherData.condition;
            const isDay = weatherData.isDay;
            // @ts-ignore
            const timeOfDay = weatherData.localTime ? weatherData.localTime.split('T')[1] : (isDay ? "Daytime" : "Nighttime");
            
            const prompt = `
              Create a tall, vertical miniature 3D cartoon scene. Pure visual art, NO text or labels.
              
              Scene Description:
              - Centerpiece: A precisely modeled miniature of the iconic building: "${mapping.buildingPrompt}"
              - Surroundings: A stylized, bustling financial district in ${mapping.city}
              - Time of Day: Local time is ${timeOfDay}. ${isDay ? "Bright natural lighting." : "Night scene with city lights, street lamps, and building windows illuminated."}
              - Weather: ${weatherDesc} conditions. ${getWeatherInstruction(weatherDesc, isDay)}
              - Materials: Soft, refined textures (polished stone, glass, metal)
              
              Composition Requirements:
              - Clean, unified composition
              - Upper 20-25%: A clear sky area with subtle clouds or atmospheric elements, providing space for text overlay. ${isDay ? "Sky should be bright." : "Sky should be dark/night sky."}
              - Lower 75-80%: The 3D city scene with buildings and details, making it feel full and vibrant
              - The cityscape should start below the sky area, creating a natural separation between information space and visual content
              
              CRITICAL RESTRICTIONS - ABSOLUTELY FORBIDDEN:
              - NO text of any kind
              - NO numbers
              - NO labels
              - NO weather information text
              - NO temperature displays
              - NO dates
              - NO exchange names
              - NO market data
              - The image must be 100% purely visual, like a photograph or painting
              - Any text, numbers, or labels will break the design
            `;

            // 4. Start Image Generation (Parallel with Market Data)
            let imagePromise: Promise<{ imageUrl: string | null, imageError: string | null }>;
            
            if (finalApiKey) {
              const model = 'gemini-3-pro-image-preview';
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${finalApiKey}`;
              
              const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseModalities: ["IMAGE"],
                  imageConfig: { aspectRatio: "3:4", imageSize: "1K" }
                }
              };

              console.log(`[API Proxy] Generating image via REST (${model})...`);
              imagePromise = fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              }).then(async (gRes) => {
                 if (!gRes.ok) {
                   const txt = await gRes.text();
                   const err = `Gemini API Error: ${gRes.status} - ${txt}`;
                   console.error(err);
                   return { imageUrl: null, imageError: err };
                 } else {
                   const json = await gRes.json();
                   // @ts-ignore
                   const part = json.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                   if (part) {
                     return { 
                       imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
                       imageError: null
                     };
                   } else {
                     return { imageUrl: null, imageError: "No image data found in response" };
                   }
                 }
              }).catch(e => {
                 const msg = e instanceof Error ? e.message : String(e);
                 console.error(msg);
                 return { imageUrl: null, imageError: msg };
              });
            } else {
              imagePromise = Promise.resolve({ imageUrl: null, imageError: "GEMINI_API_KEY not configured" });
            }

            // 5. Wait for both
            const [marketData, imageResult] = await Promise.all([marketPromise, imagePromise]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              exchange: exchangeName,
              mapping,
              weather: weatherData,
              market: { ...marketData, indexName: mapping.indexName, date: dateStr },
              imageUrl: imageResult.imageUrl,
              imageError: imageResult.imageError
            }));
            return;
          } catch (e) {
            console.error(e);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal Error' }));
          }
        }

        // 3. /api/exchange-details
        if (req.url?.startsWith('/api/exchange-details')) {
          if (req.method !== 'GET') return next();
          try {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const name = url.searchParams.get('name');
            if (!name || !finalApiKey) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Missing name or API key' }));
              return;
            }
            
            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${finalApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `Summary for ${name}. History, significance, listed companies. 3-4 bullet key facts. Trading hours.` }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: {
                      description: { type: "string" },
                      keyFacts: { type: "array", items: { type: "string" } },
                      tradingHours: { type: "string" }
                    }
                  }
                }
              })
            });
            
            const json = await r.json();
            // @ts-ignore
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(text);
            return;
          } catch (e) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to load details' }));
          }
        }

        next();
      });
    }
  };
}
