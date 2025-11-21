import React, { useEffect, useState } from 'react';
import { fetchMarketTicker, MarketTickerData } from '../services/marketService';

const Ticker: React.FC = () => {
  const [data, setData] = useState<MarketTickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback data in case API fails (Approximate values)
  const fallbackData: MarketTickerData[] = [
    { symbol: 'SPY', price: 595.40, change: 1.20, changesPercentage: 0.20 },
    { symbol: 'QQQ', price: 505.10, change: 2.50, changesPercentage: 0.50 },
    { symbol: 'AAPL', price: 231.50, change: 1.10, changesPercentage: 0.48 },
    { symbol: 'MSFT', price: 420.00, change: -1.50, changesPercentage: -0.36 },
    { symbol: 'NVDA', price: 142.50, change: 2.10, changesPercentage: 1.50 },
    { symbol: 'GOOGL', price: 178.20, change: 0.80, changesPercentage: 0.45 },
    { symbol: 'AMZN', price: 202.10, change: 1.20, changesPercentage: 0.60 },
    { symbol: 'META', price: 575.00, change: 3.50, changesPercentage: 0.61 },
    { symbol: 'TSLA', price: 325.00, change: 5.00, changesPercentage: 1.56 },
    { symbol: 'JPM', price: 240.00, change: 0.50, changesPercentage: 0.21 },
    { symbol: 'XOM', price: 118.00, change: -0.40, changesPercentage: -0.34 }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchMarketTicker();
        if (result && result.length > 0) {
          setData(result);
        } else {
          // Use fallback if empty result
          console.warn('Ticker: No data received, using fallback');
          setData(fallbackData);
        }
      } catch (error) {
        console.error('Failed to load ticker data', error);
        setData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Refresh every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  // if (isLoading || data.length === 0) return null; // Don't hide on load, show cached or fallback
  if (data.length === 0 && isLoading) return null; // Only hide on initial load if absolutely no data

  // Helper to format price based on asset type logic (simplified)
  const formatPrice = (symbol: string, price: number) => {
    if (symbol === 'EURUSD') return price.toFixed(4);
    return price.toFixed(2);
  };

  // Duplicate data to create seamless loop effect
  const tickerItems = [...data, ...data, ...data];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#0B101B]/90 backdrop-blur-md border-t border-amber-500/20 h-10 flex items-center overflow-hidden pointer-events-none">
      <div className="flex animate-ticker whitespace-nowrap">
        {tickerItems.map((item, index) => (
          <div key={`${item.symbol}-${index}`} className="flex items-center mx-6 text-xs md:text-sm font-mono">
            <span className="font-bold text-white mr-2">{item.symbol}</span>
            <span className="text-gray-300 mr-2">{formatPrice(item.symbol, item.price)}</span>
            <span className={`${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'} flex items-center`}>
              <span className="mr-1">{item.change >= 0 ? '▲' : '▼'}</span>
              {Math.abs(item.changesPercentage).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Ticker;


