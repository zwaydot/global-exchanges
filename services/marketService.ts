export interface MarketTickerData {
  symbol: string;
  price: number;
  change: number;
  changesPercentage: number;
}

export const fetchMarketTicker = async (): Promise<MarketTickerData[]> => {
  try {
    // Call our own Cloudflare Function instead of direct external API
    const response = await fetch('/api/market-ticker');
    
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching market ticker:', error);
    return [];
  }
};
