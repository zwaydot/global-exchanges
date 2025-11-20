import { GoogleGenAI, Type } from "@google/genai";
import { ExchangeDetails } from '../types';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchExchangeDetails = async (exchangeName: string): Promise<ExchangeDetails> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Provide a detailed but concise summary for the ${exchangeName}. 
    Focus on its history, its global significance, and the types of companies listed.
    Also provide 3-4 bullet point 'key facts' and typical trading hours.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A 2-3 sentence summary of the exchange history and importance." },
            keyFacts: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of 3-4 interesting short facts."
            },
            tradingHours: { type: Type.STRING, description: "Typical local trading hours (e.g. 09:30 - 16:00)." }
          },
          required: ["description", "keyFacts", "tradingHours"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as ExchangeDetails;

  } catch (error) {
    console.error("Error fetching exchange details:", error);
    return {
      description: "Unable to load details at this time. Please try again later.",
      keyFacts: ["Data unavailable"],
      tradingHours: "--:--"
    };
  }
};