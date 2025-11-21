import React, { useEffect, useState } from 'react';
import { fetchMarketTicker, MarketTickerData } from '../services/marketService';

const Ticker: React.FC = () => {
  const [data, setData] = useState<MarketTickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback data in case API fails (Approximate values)
  const fallbackData: MarketTickerData[] = [
    { symbol: 'SPY', price: 595.10, change: 1.48, changesPercentage: 0.25 },
    { symbol: 'QQQ', price: 505.02, change: 2.04, changesPercentage: 0.40 },
    { symbol: 'SPYG', price: 86.42, change: 0.27, changesPercentage: 0.31 },
    { symbol: 'VWO', price: 44.73, change: -0.05, changesPercentage: -0.11 },
    { symbol: 'AAPL', price: 230.08, change: 1.00, changesPercentage: 0.44 },
    { symbol: 'MSFT', price: 421.35, change: 1.60, changesPercentage: 0.38 },
    { symbol: 'NVDA', price: 142.66, change: 1.52, changesPercentage: 1.08 },
    { symbol: 'GOOGL', price: 178.84, change: 0.82, changesPercentage: 0.46 },
    { symbol: 'AMZN', price: 202.74, change: 1.24, changesPercentage: 0.62 },
    { symbol: 'META', price: 575.31, change: 3.28, changesPercentage: 0.57 },
    { symbol: 'JPM', price: 240.92, change: 0.45, changesPercentage: 0.19 },
    { symbol: 'XOM', price: 118.24, change: -0.33, changesPercentage: -0.28 }
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


