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
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
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

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

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
    console.error("Error fetching exchange details:", error);
    
    // 返回错误响应
    return new Response(
      JSON.stringify({
        description: "Unable to load details at this time. Please try again later.",
        keyFacts: ["Data unavailable"],
        tradingHours: "--:--"
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

