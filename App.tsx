import React, { useState, useEffect, useCallback } from 'react';
import GlobeViz from './components/GlobeViz';
import DetailPanel from './components/DetailPanel';
import { STOCK_EXCHANGES } from './constants';
import { Exchange, ExchangeDetails } from './types';
import { fetchExchangeDetails } from './services/geminiService';

const App: React.FC = () => {
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [details, setDetails] = useState<ExchangeDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Remove loader manually if window load event fired before React hydration
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  const handleExchangeSelect = useCallback(async (exchange: Exchange) => {
    // Don't re-fetch if selecting the same one
    if (selectedExchange?.id === exchange.id) return;

    setSelectedExchange(exchange);
    setDetails(null);
    setIsLoading(true);

    try {
      const data = await fetchExchangeDetails(exchange.name);
      setDetails(data);
    } catch (error) {
      console.error("Failed to load details", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedExchange]);

  const closePanel = () => {
    setSelectedExchange(null);
    setDetails(null);
  };

  return (
    <div className="relative w-full h-screen bg-[#020617] overflow-hidden">
      {/* Semantic Header for SEO */}
      <header className="absolute top-0 left-0 p-4 md:p-6 z-10 pointer-events-none w-full md:w-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tighter drop-shadow-md">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-cyan-300">Global</span> Exchanges
        </h1>
        <p className="text-gray-400 text-sm md:max-w-xs mt-2 drop-shadow-sm max-w-[240px]">
          Interactive 3D visualization of major stock exchanges and trading volumes.
        </p>
        <nav>
          <a 
            href="https://driven.ai/?u=globalexchanges" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-3 inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-cyan-300 text-xs md:text-sm pointer-events-auto group hover:opacity-80 transition-opacity font-medium"
            aria-label="Visit Driven.ai to see market drivers"
          >
            See what's driving the market <span className="inline-block transition-transform group-hover:translate-x-1 text-amber-200">→</span>
          </a>
        </nav>
      </header>

      {/* Semantic Legend Section */}
      <section 
        aria-label="Map Legend"
        className="absolute bottom-6 left-4 right-4 md:bottom-8 md:left-8 md:right-auto z-10 pointer-events-none bg-[#0B101B]/80 backdrop-blur-md p-3 md:p-5 rounded-xl border border-amber-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-row md:flex-col justify-center md:justify-start items-center gap-4 md:w-auto"
      >
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest hidden md:block">Market Activity</div>
        
        {/* Icons Container */}
        <div className="flex items-center gap-4 md:gap-8" role="img" aria-label="Pulse indicators: larger pulse means higher volume">
           {/* High Activity Icon */}
           <div className="flex flex-col items-center gap-2">
              <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                 <div className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-400 rounded-full shadow-[0_0_10px_#fbbf24] z-10"></div>
                 <div className="absolute w-4 h-4 md:w-5 md:h-5 border border-amber-400/80 rounded-full"></div>
                 <div className="absolute w-8 h-8 md:w-10 md:h-10 border border-amber-400/40 rounded-full"></div>
              </div>
              <span className="text-[9px] md:text-[10px] text-gray-400 font-medium whitespace-nowrap">High Volume</span>
           </div>
           
           {/* Low Activity Icon */}
           <div className="flex flex-col items-center gap-2">
              <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                 <div className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-amber-400/70 rounded-full z-10"></div>
                 <div className="absolute w-3 h-3 md:w-4 md:h-4 border border-amber-400/30 rounded-full"></div>
              </div>
              <span className="text-[9px] md:text-[10px] text-gray-500 font-medium whitespace-nowrap">Low Volume</span>
           </div>
        </div>
      </section>

      {/* SEO & Accessibility: Hidden text content for Crawlers and Screen Readers */}
      {/* AEO Optimization: Providing clear Q&A format for Answer Engines */}
      <article className="sr-only">
        <h2>Global Stock Market Data</h2>
        <p>This application provides a 3D interactive view of the world's most significant financial centers.</p>
        
        <h3>Frequently Asked Questions about Global Markets</h3>
        <dl>
          <dt>What is the largest stock exchange in the world?</dt>
          <dd>The New York Stock Exchange (NYSE) is the largest by market capitalization, valued at over $26 Trillion USD.</dd>
          
          <dt>Where is the NASDAQ located?</dt>
          <dd>The NASDAQ is headquartered in New York City, USA, and is a major hub for technology companies.</dd>
          
          <dt>What are the major Asian stock exchanges?</dt>
          <dd>Major Asian exchanges include the Tokyo Stock Exchange (TSE), Shanghai Stock Exchange (SSE), Shenzhen Stock Exchange (SZSE), and Hong Kong Stock Exchange (HKEX).</dd>
        </dl>

        <h3>Exchange Data Listing</h3>
        <ul itemScope itemType="https://schema.org/FinancialService">
          {STOCK_EXCHANGES.map(ex => (
            <li key={ex.id} itemProp="hasPart" itemScope itemType="https://schema.org/FinancialService">
              <h4 itemProp="name">{ex.name} ({ex.id.toUpperCase()})</h4>
              <p><strong>Location:</strong> <span itemProp="location">{ex.city}, {ex.country}</span></p>
              <p><strong>Daily Trading Volume:</strong> ${ex.dailyVolumeBillionUSD} Billion USD</p>
              <p><strong>Market Capitalization:</strong> ${ex.marketCapTrillionUSD} Trillion USD</p>
              <p><strong>Primary Currency:</strong> <span itemProp="currenciesAccepted">{ex.currency}</span></p>
            </li>
          ))}
        </ul>
      </article>

      {/* Main Visualization */}
      <main className="w-full h-full">
        <GlobeViz 
          exchanges={STOCK_EXCHANGES} 
          onSelect={handleExchangeSelect} 
        />
      </main>

      {/* Side Panel */}
      {selectedExchange && (
        <aside aria-label="Exchange Details Panel">
          <DetailPanel 
            exchange={selectedExchange} 
            details={details} 
            isLoading={isLoading}
            onClose={closePanel}
          />
        </aside>
      )}
    </div>
  );
};

export default App;