import { EXCHANGE_MAPPINGS, DEFAULT_MAPPING } from '../../lib/exchangeMapping';

interface Env {
  FMP_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

interface OpenMeteoResponse {
  current?: {
    weather_code?: number;
    is_day?: number;
    temperature_2m?: number;
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
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
    const url = new URL(context.request.url);
    const exchangeName = url.searchParams.get('exchange');

    if (!exchangeName) {
      throw new Error('Exchange name is required');
    }

    // 1. Get Exchange Data
    const mapping = EXCHANGE_MAPPINGS[exchangeName] || DEFAULT_MAPPING;
    
    // 2. Start Fetching Data (Parallel Optimization)
    // Start fetching weather and market data immediately
    const weatherPromise = fetchWeather(mapping.lat, mapping.lon);
    const marketPromise = fetchMarketData(
        mapping.indexSymbol, 
        mapping.indexName,
        context.env.GEMINI_API_KEY,
        context.env.FMP_API_KEY
    );

    // 3. Wait for Weather ONLY (needed for prompt)
    const weatherData = await weatherPromise;
    
    // 4. Generate Image Prompt
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const weatherDesc = weatherData.condition;
    const isDay = weatherData.isDay;
    
    // Use actual local time if available, otherwise generic Daytime/Nighttime
    const timeOfDay = weatherData.localTime 
        ? weatherData.localTime.split('T')[1] 
        : (isDay ? "Daytime" : "Nighttime");
    
    // Simplified Prompt: Pure visual scene, NO text whatsoever
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

    // 5. Start Image Generation (Parallel with Market Data)
    const apiKey = context.env.GEMINI_API_KEY;
    const imagePromise = apiKey 
      ? generateImageWithGeminiRest(apiKey, prompt)
          .then(url => ({ url, error: null }))
          .catch(err => {
            console.error("Image generation failed:", err);
            return { url: null, error: err instanceof Error ? err.message : String(err) };
          })
      : Promise.resolve({ url: null, error: "GEMINI_API_KEY not configured" });

    // 6. Wait for both Image and Market Data
    const [marketData, imageResult] = await Promise.all([
      marketPromise,
      imagePromise
    ]);

    const imageUrl = imageResult.url;
    const imageError = imageResult.error;

    return new Response(JSON.stringify({
      exchange: exchangeName,
      mapping,
      weather: weatherData,
      market: {
        ...marketData,
        indexName: mapping.indexName,
        date: dateStr
      },
      promptUsed: prompt,
      imageUrl,
      imageError
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error("Generate Snapshot Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};

// --- Helpers ---

async function fetchWeather(lat: number, lon: number) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,is_day&timezone=auto`);
    const data = await res.json() as OpenMeteoResponse & { current?: { time?: string }; timezone?: string };
    
    const code = data.current?.weather_code ?? 0;
    const isDayValue = data.current?.is_day;
    const localTime = data.current?.time; // "2025-12-06T17:15"
    const timezone = data.timezone;
    
    // is_day: 1 = day, 0 = night
    // If is_day is explicitly 0, it's night. Otherwise, check the time
    let isDay = true; // Default to day
    if (isDayValue !== undefined) {
      isDay = isDayValue === 1;
    } else if (localTime) {
      // Fallback: parse local time to determine day/night
      const hour = parseInt(localTime.split('T')[1]?.split(':')[0] || '12');
      isDay = hour >= 6 && hour < 20; // 6 AM to 8 PM is day
    }
    
    console.log(`[Weather] lat=${lat}, lon=${lon}, timezone=${timezone}, localTime=${localTime}, is_day=${isDayValue}, calculated isDay=${isDay}`);
    
    let condition = "Clear";
    if (code === 0) condition = "Clear";
    else if (code >= 1 && code <= 3) condition = "Cloudy";
    else if (code >= 45 && code <= 48) condition = "Foggy";
    else if (code >= 51 && code <= 67) condition = "Raining";
    else if (code >= 71 && code <= 77) condition = "Snowing";
    else if (code >= 95) condition = "Thunderstorm";
    
    return { condition, temp: data.current?.temperature_2m ?? 20, isDay, localTime };
  } catch (e) {
    console.error("Weather fetch failed:", e);
    // On error, try to determine day/night based on current time in that timezone
    // For now, default to night if it's likely evening (after 6 PM UTC+8)
    const now = new Date();
    const hour = now.getUTCHours() + 8; // UTC+8 for China
    const isDay = hour >= 6 && hour < 20;
    return { condition: "Clear", temp: 20, isDay, localTime: null };
  }
}

/**
 * Fetch market data using Gemini search as primary method
 * Falls back to FMP API if Gemini fails
 */
async function fetchMarketData(
  symbol: string, 
  indexName: string,
  geminiApiKey?: string,
  fmpApiKey?: string
): Promise<{ price: number; change: number; changePercent: number }> {
  console.log(`[Market Data] Fetching ${indexName} (${symbol})...`);
  console.log(`[Market Data] Gemini API Key: ${geminiApiKey ? 'Present' : 'Missing'}`);
  console.log(`[Market Data] FMP API Key: ${fmpApiKey ? 'Present' : 'Missing'}`);
  
  // Try Gemini search first (works for all indices)
  if (geminiApiKey) {
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`[Market Data] Attempting Gemini search for ${indexName} (attempt ${retryCount + 1}/${maxRetries})...`);
        const geminiData = await fetchMarketDataViaGemini(indexName, symbol, geminiApiKey, retryCount > 0);
        console.log(`[Market Data] Gemini returned:`, geminiData);
        
        // 验证数据合理性
        const isValid = geminiData.price > 0 && 
                       Math.abs(geminiData.changePercent) <= 50; // 单日涨跌幅通常不会超过50%
        
        if (isValid) {
          console.log(`[Market Data] ✅ Successfully fetched ${indexName} via Gemini:`, geminiData);
          return geminiData;
        } else {
          if (geminiData.price <= 0) {
            console.warn(`[Market Data] ⚠️ Gemini returned invalid price (${geminiData.price}) for ${indexName}`);
          }
          if (Math.abs(geminiData.changePercent) > 50) {
            console.warn(`[Market Data] ⚠️ Gemini returned unusual changePercent (${geminiData.changePercent}%) for ${indexName}`);
          }
          
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`[Market Data] Retrying Gemini search with different strategy...`);
            // 等待一小段时间再重试
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          } else {
            console.warn(`[Market Data] ⚠️ Gemini returned invalid data after ${maxRetries} attempts, trying FMP...`);
          }
        }
      } catch (e) {
        console.error(`[Market Data] ❌ Gemini failed for ${indexName} (attempt ${retryCount + 1}):`, e);
        retryCount++;
        if (retryCount >= maxRetries) {
          console.warn(`[Market Data] Trying FMP fallback after ${maxRetries} failed attempts...`);
        } else {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  } else {
    console.warn(`[Market Data] ⚠️ No Gemini API Key, skipping Gemini search`);
  }

  // Fallback to FMP API (if available and symbol is supported)
  if (fmpApiKey && symbol.startsWith('^')) {
    try {
      const url = `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${fmpApiKey}`;
      console.log(`[Market Data] Attempting FMP API for ${symbol}...`);
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json() as any[];
        console.log(`[Market Data] FMP response:`, data);
        const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (item && item.price !== undefined) {
          const result = {
            price: item.price ?? 0,
            change: item.change ?? 0,
            changePercent: item.changesPercentage ?? 0
          };
          console.log(`[Market Data] ✅ Successfully fetched ${indexName} via FMP:`, result);
          return result;
        } else {
          console.warn(`[Market Data] ⚠️ FMP returned invalid data for ${symbol}`);
        }
      } else {
        console.error(`[Market Data] ❌ FMP API error: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      console.error(`[Market Data] ❌ FMP failed for ${symbol}:`, e);
    }
  } else {
    if (!fmpApiKey) {
      console.warn(`[Market Data] ⚠️ No FMP API Key`);
    }
    if (!symbol.startsWith('^')) {
      console.warn(`[Market Data] ⚠️ Symbol ${symbol} doesn't start with ^, FMP may not support it`);
    }
  }

  console.error(`[Market Data] ❌ All methods failed for ${indexName}, returning zeros`);
  return { price: 0, change: 0, changePercent: 0 };
}

/**
 * Use Gemini's search capability to fetch real-time index data
 * Optimized prompt to ensure accurate, real-time data retrieval
 * @param isRetry - If true, use alternative search strategy for retry attempts
 */
async function fetchMarketDataViaGemini(
  indexName: string,
  symbol: string,
  apiKey: string,
  isRetry: boolean = false
): Promise<{ price: number; change: number; changePercent: number }> {
  const model = 'gemini-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // 获取当前日期和时间，用于验证数据新鲜度
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const now = new Date();
  const currentDateStr = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // 重试时使用更具体的搜索策略
  const searchQueries = isRetry 
    ? [
        `"${indexName}" site:finance.yahoo.com`,
        `"${symbol}" site:google.com/finance`,
        `"${indexName}" "${today}" stock price`,
        `"${indexName}" live market data today`
      ]
    : [
        `${indexName} ${today} price`,
        `${symbol} live quote today`,
        `${indexName} current market price`,
        `${indexName} real-time index value`
      ];
  
  const prompt = `You are a financial data expert. Your task is to find the MOST RECENT, REAL-TIME trading data for ${indexName} (ticker: ${symbol}).

SEARCH STRATEGY:
1. Search using these specific queries to find the latest data:
${searchQueries.map(q => `   - ${q}`).join('\n')}
2. ${isRetry ? 'Focus on these specific authoritative sources:' : 'Prioritize authoritative sources in this order:'}
   - Official exchange website
   - Yahoo Finance (finance.yahoo.com) - search for "${indexName}" or "${symbol}"
   - Google Finance (google.com/finance)
   - Bloomberg (bloomberg.com)
   - MarketWatch (marketwatch.com)
   - Reuters Finance (reuters.com)
3. Check the timestamp/date on the source - data MUST be from ${currentDateStr} or the most recent trading session
4. If markets are closed, use the latest closing price from the most recent trading day
5. ${isRetry ? 'Look for the main quote/price widget on the page, which typically shows the current price, change, and change percentage prominently.' : 'Extract data from the main quote display, not from historical charts or tables.'}

DATA EXTRACTION:
- Extract the CURRENT/LIVE index value (the main price shown prominently, not historical data)
- Extract the CHANGE in points (the absolute change from previous close, can be positive or negative)
- Extract the CHANGE PERCENTAGE (the percentage change, can be positive or negative)
- All values must be NUMBERS (not strings, no commas, no currency symbols like $, €, ¥)
- Remove any formatting: "12,345.67" → 12345.67

VALIDATION:
- Price must be a positive number (typically > 0)
- Change percentage should typically be between -20% and +20% for normal trading days (extreme moves can be -50% to +50%)
- Verify the data source shows it's from today or the most recent trading day
- Double-check that you're reading the CURRENT price, not yesterday's close or a historical value

OUTPUT FORMAT:
Output ONLY valid JSON (no markdown code blocks, no explanations, no text before/after, no trailing commas):
{"price": 1234.56, "change": 12.34, "changePercent": 0.56}

If you cannot find reliable current data after thorough search, output: {"price": 0, "change": 0, "changePercent": 0}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{
      googleSearch: {} // Enable Google Search grounding
    }]
  };

  console.log(`[Gemini] Searching for ${indexName} (${symbol}) real-time data...`);
  console.log(`[Gemini] Using model: ${model}`);
  console.log(`[Gemini] Prompt: ${prompt.substring(0, 100)}...`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Gemini] API error ${response.status}:`, errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json() as any;
  console.log(`[Gemini] Response structure:`, {
    hasCandidates: !!result.candidates,
    candidatesLength: result.candidates?.length,
    firstCandidate: result.candidates?.[0] ? 'exists' : 'missing'
  });
  
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    // Try to see if it returned a function call or something else, but text usually contains the final answer
    console.warn("[Gemini] Empty text response, full result:", JSON.stringify(result).substring(0, 500));
    throw new Error("No response text from Gemini");
  }

  console.log(`[Gemini] Raw response text:`, text.substring(0, 200));

  try {
    // Clean up markdown code blocks if present
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Attempt to fix common JSON syntax errors from LLMs (like single quotes or unquoted keys)
    // This is a simple heuristic fallback if strict parse fails
    try {
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            JSON.parse(jsonMatch[0]); // Test parse
            cleanText = jsonMatch[0];
        }
    } catch (e) {
        // If strict parse fails, try to sanitize
        console.warn("[Gemini] Strict JSON parse failed, attempting to sanitize...");
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            let sanitized = jsonMatch[0]
                // Replace single quotes with double quotes for keys
                .replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3')
                // Quote unquoted keys
                .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
                // Replace single quotes with double quotes for string values
                .replace(/:\s*'([^']*)'/g, ': "$1"');
            cleanText = sanitized;
        }
    }

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        console.log(`[Gemini] Parsed JSON data:`, data);
        
        // 数据验证：确保价格是合理的正数
        const price = typeof data.price === 'number' ? data.price : 0;
        const change = typeof data.change === 'number' ? data.change : 0;
        const changePercent = typeof data.changePercent === 'number' ? data.changePercent : 0;
        
        // 验证数据合理性
        if (price <= 0) {
          console.warn(`[Gemini] ⚠️ Invalid price (${price}), data may be incorrect`);
        }
        if (Math.abs(changePercent) > 50) {
          console.warn(`[Gemini] ⚠️ Unusual changePercent (${changePercent}%), data may be incorrect`);
        }
        
        const result = { price, change, changePercent };
        console.log(`[Gemini] ✅ Final validated result:`, result);
        return result;
    }
    console.error(`[Gemini] No JSON match found in text:`, cleanText);
    throw new Error("No JSON found in text");
  } catch (e) {
    console.error(`[Gemini] Failed to parse response. Error:`, e);
    console.error(`[Gemini] Response text was:`, text);
    throw new Error("Invalid JSON response from Gemini");
  }
}

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

/**
 * Pure REST implementation for Gemini 3 Pro Image Generation
 * Docs: https://ai.google.dev/gemini-api/docs/gemini-3
 */
async function generateImageWithGeminiRest(apiKey: string, prompt: string) {
  const model = 'gemini-3-pro-image-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      // Explicitly requesting IMAGE modality
      responseModalities: ["IMAGE"],
      // Using imageConfig for precise control as per official docs
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: "1K" // Or '4K' if higher res needed, but 1K is faster
      }
    }
  };

  console.log(`[Gemini] Calling ${model} via REST...`);
  
  // Cloudflare Workers fetch doesn't support AbortController signal in standard way for timeout usually, 
  // but we can use Promise.race or similar if needed. 
  // However, CF workers have their own execution limits (usually 30s CPU time).
  // Let's just add basic logging for now.
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `Gemini API Error: ${response.status}`;
    try {
      const errJson = JSON.parse(errorText);
      if (errJson.error?.message) errorMsg += ` - ${errJson.error.message}`;
    } catch {
      errorMsg += ` - ${errorText}`;
    }
    throw new Error(errorMsg);
  }

  const result = await response.json() as any;

  // Parse Response: content -> parts -> inlineData
  if (result.candidates?.[0]?.content?.parts) {
    for (const part of result.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image data found in Gemini response");
}
