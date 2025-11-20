export const onRequest: PagesFunction = async (context) => {
  // 处理 CORS
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
    // 从环境变量获取 API key
    const apiKey = context.env.GEMINI_API_KEY;
    
    // 添加调试日志（在 Cloudflare 控制台可见）
    console.log('[Exchange Details API] Request received');
    console.log('[Exchange Details API] API Key exists:', !!apiKey);
    console.log('[Exchange Details API] API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.error('[Exchange Details API] GEMINI_API_KEY not configured in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'GEMINI_API_KEY not configured',
          message: 'Please set GEMINI_API_KEY in Cloudflare Pages environment variables'
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

    // 获取请求参数
    const url = new URL(context.request.url);
    const exchangeName = url.searchParams.get('name');

    if (!exchangeName) {
      return new Response(
        JSON.stringify({ error: 'Exchange name is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 使用 Gemini REST API
    const model = "gemini-2.5-flash";
    // 使用请求头方式传递 API key（更安全）
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
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

    console.log('[Exchange Details API] Calling Gemini API for:', exchangeName);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Exchange Details API] Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    console.log('[Exchange Details API] Gemini API response received');

    const result = await response.json();
    
    // 提取响应文本
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(text);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error("[Exchange Details API] Error:", error);
    if (error instanceof Error) {
      console.error("[Exchange Details API] Error message:", error.message);
      console.error("[Exchange Details API] Error stack:", error.stack);
    }
    
    // 返回错误响应
    return new Response(
      JSON.stringify({
        description: "Unable to load details at this time. Please try again later.",
        keyFacts: ["Data unavailable"],
        tradingHours: "--:--",
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 200, // 返回 200 以便前端可以显示错误消息
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

