import { ExchangeDetails } from '../types';

// 通过 Cloudflare Functions API 获取交易所详情
export const fetchExchangeDetails = async (exchangeName: string): Promise<ExchangeDetails> => {
  try {
    // 使用相对路径调用 Cloudflare Functions API
    const apiUrl = `/api/exchange-details?name=${encodeURIComponent(exchangeName)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data as ExchangeDetails;

  } catch (error) {
    console.error("Error fetching exchange details:", error);
    return {
      description: "Unable to load details at this time. Please try again later.",
      keyFacts: ["Data unavailable"],
      tradingHours: "--:--"
    };
  }
};