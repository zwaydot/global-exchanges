import React, { useEffect, useState } from 'react';
import { fetchMarketTicker, MarketTickerData } from '../services/marketService';

const Ticker: React.FC = () => {
  const [data, setData] = useState<MarketTickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback data in case API fails (Updated: 2025-01-21)
  // 注意：市场数据实时变化，此数据仅作为API失败时的备用，实际应通过API获取最新数据
  const fallbackData: MarketTickerData[] = [
    { symbol: 'SPY', price: 652.53, change: -9.92, changesPercentage: -1.52 },
    { symbol: 'QQQ', price: 585.67, change: -13.88, changesPercentage: -2.37 },
    { symbol: 'VWO', price: 52.67, change: -0.61, changesPercentage: -1.14 },
    { symbol: 'AAPL', price: 268.14, change: 1.89, changesPercentage: 0.71 },
    { symbol: 'MSFT', price: 472.13, change: -6.30, changesPercentage: -1.32 },
    { symbol: 'NVDA', price: 177.30, change: -3.34, changesPercentage: -1.85 },
    { symbol: 'GOOGL', price: 298.13, change: 8.68, changesPercentage: 2.99 },
    { symbol: 'AMZN', price: 217.10, change: -0.04, changesPercentage: -0.02 },
    { symbol: 'META', price: 587.27, change: -1.88, changesPercentage: -0.32 },
    { symbol: 'TSLA', price: 394.60, change: -0.63, changesPercentage: -0.16 }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchMarketTicker();
        if (result && result.length > 0) {
          setData(result);
        } else {
          // Use fallback if empty result
          if (import.meta.env.DEV) {
            console.warn('Ticker: No data received, using fallback');
          }
          setData(fallbackData);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to load ticker data', error);
        }
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
            <span className="text-gray-300 mr-2 font-num">{formatPrice(item.symbol, item.price)}</span>
            <span className={`${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'} flex items-center font-num`}>
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


