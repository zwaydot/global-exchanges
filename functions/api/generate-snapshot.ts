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
    
    // 2. Fetch Data in Parallel
    const [weatherData, marketData] = await Promise.all([
      fetchWeather(mapping.lat, mapping.lon),
      fetchMarketData(
        mapping.indexSymbol, 
        mapping.indexName,
        context.env.GEMINI_API_KEY,
        context.env.FMP_API_KEY
      )
    ]);

    // 3. Generate Image Prompt
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

    // 4. Call Image Generation API (Pure REST)
    const apiKey = context.env.GEMINI_API_KEY;
    let imageUrl = null;
    let imageError = null;

    if (apiKey) {
      try {
        imageUrl = await generateImageWithGeminiRest(apiKey, prompt);
      } catch (err) {
        console.error("Image generation failed:", err);
        imageError = err instanceof Error ? err.message : String(err);
      }
    } else {
      imageError = "GEMINI_API_KEY not configured";
    }

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
    const data = await res.json() as OpenMeteoResponse & { current?: { time?: string } };
    
    const code = data.current?.weather_code ?? 0;
    const isDay = data.current?.is_day ?? 1;
    const localTime = data.current?.time; // "2025-12-06T17:15"
    
    let condition = "Clear";
    if (code === 0) condition = "Clear";
    else if (code >= 1 && code <= 3) condition = "Cloudy";
    else if (code >= 45 && code <= 48) condition = "Foggy";
    else if (code >= 51 && code <= 67) condition = "Raining";
    else if (code >= 71 && code <= 77) condition = "Snowing";
    else if (code >= 95) condition = "Thunderstorm";
    
    return { condition, temp: data.current?.temperature_2m ?? 20, isDay: !!isDay, localTime };
  } catch (e) {
    console.error("Weather fetch failed:", e);
    return { condition: "Sunny", temp: 20, isDay: true };
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
    try {
      console.log(`[Market Data] Attempting Gemini search for ${indexName}...`);
      const geminiData = await fetchMarketDataViaGemini(indexName, symbol, geminiApiKey);
      console.log(`[Market Data] Gemini returned:`, geminiData);
      if (geminiData.price > 0) {
        console.log(`[Market Data] ✅ Successfully fetched ${indexName} via Gemini:`, geminiData);
        return geminiData;
      } else {
        console.warn(`[Market Data] ⚠️ Gemini returned price=0 for ${indexName}, trying FMP...`);
      }
    } catch (e) {
      console.error(`[Market Data] ❌ Gemini failed for ${indexName}:`, e);
      console.warn(`[Market Data] Trying FMP fallback...`);
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
 * REMOVED JSON Schema to support tool use better
 */
async function fetchMarketDataViaGemini(
  indexName: string,
  symbol: string,
  apiKey: string
): Promise<{ price: number; change: number; changePercent: number }> {
  const model = 'gemini-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `Search for the current real-time price and percentage change of ${indexName} (${symbol}). 
  After finding the data, output it in this exact STRICT JSON format (keys must be double-quoted string, no trailing commas, no markdown):
  {"price": 1234.56, "change": 12.34, "changePercent": 0.56}
  If not found, output: {"price": 0, "change": 0, "changePercent": 0}`;

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
        const result = {
          price: typeof data.price === 'number' ? data.price : 0,
          change: typeof data.change === 'number' ? data.change : 0,
          changePercent: typeof data.changePercent === 'number' ? data.changePercent : 0
        };
        console.log(`[Gemini] Final result:`, result);
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
