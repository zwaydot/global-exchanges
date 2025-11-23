import React, { useState, useEffect, useCallback } from 'react';
import GlobeViz from './components/GlobeViz';
import DetailPanel from './components/DetailPanel';
import Ticker from './components/Ticker';
import { STOCK_EXCHANGES } from './constants';
import { Exchange, ExchangeDetails, ExchangeStatsMeta, ExchangeStatsSnapshot } from './types';
import { fetchExchangeDetails } from './services/geminiService';
import { fetchExchangeStats } from './services/exchangeStatsService';
import { normalizeKey } from './lib/exchangeStats';

// Parent exchange mapping for fallback lookup
// If a child exchange (e.g., Euronext Paris) has no data, try parent (e.g., Euronext)
const PARENT_EXCHANGE_MAP: Record<string, string> = {
  'euronextamsterdam': 'euronext',
  'euronextbrussels': 'euronext',
  'euronextdublin': 'euronext',
  'euronextoslo': 'euronext',
  'euronextparis': 'euronext',
  'nasdaqomxnordiccopenhagen': 'nasdaqnordicandbaltics',
  'nasdaqomxnordichelsinki': 'nasdaqnordicandbaltics',
  'nasdaqomxnordiciceland': 'nasdaqnordicandbaltics',
  'stockholm': 'nasdaqnordicandbaltics',
};

const App: React.FC = () => {
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [details, setDetails] = useState<ExchangeDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statsByExchange, setStatsByExchange] = useState<Record<string, ExchangeStatsSnapshot | null>>({});
  const [statsMeta, setStatsMeta] = useState<ExchangeStatsMeta | null>(null);
  const [statsLoadingExchange, setStatsLoadingExchange] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Remove loader manually if window load event fired before React hydration
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  const loadStatsForExchange = useCallback(async (exchange: Exchange) => {
    if (statsByExchange[exchange.id]) {
      setStatsError(null);
      return;
    }

    setStatsError(null);
    setStatsLoadingExchange(exchange.id);
    try {
      // Use normalized wfeName for API lookup, fallback to id if wfeName is not set
      let lookupKey = normalizeKey(exchange.wfeName || exchange.id);
      let response = await fetchExchangeStats(lookupKey);
      
      // If no data found and this is a child exchange, try parent exchange
      if (!response.stats && PARENT_EXCHANGE_MAP[lookupKey]) {
        const parentKey = PARENT_EXCHANGE_MAP[lookupKey];
        const parentResponse = await fetchExchangeStats(parentKey);
        if (parentResponse.stats) {
          response = parentResponse;
        }
      }
      
      // Only set meta if it exists (null means no data available, which is OK)
      if (response.meta) {
        setStatsMeta(response.meta);
      }
      setStatsByExchange(prev => ({
        ...prev,
        [exchange.id]: response.stats ?? null,
      }));
      // If stats is null, that's OK - we'll use fallback data. Only show error for actual failures.
    } catch (error) {
      console.error('[App] Failed to load exchange stats', error);
      // In local development, API endpoints may not be available (Cloudflare Pages Functions)
      // Don't show error in this case - fallback data will be used
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalDev) {
        // Only show error in production/staging where API should be available
        setStatsError('Unable to load latest stats right now.');
      }
    } finally {
      setStatsLoadingExchange(current => (current === exchange.id ? null : current));
    }
  }, [statsByExchange]);

  const handleExchangeSelect = useCallback(async (exchange: Exchange) => {
    // Don't re-fetch if selecting the same one
    if (selectedExchange?.id === exchange.id) return;

    setSelectedExchange(exchange);
    setDetails(null);
    setIsLoading(true);
    void loadStatsForExchange(exchange);

    try {
      const data = await fetchExchangeDetails(exchange.name);
      setDetails(data);
    } catch (error) {
      console.error("Failed to load details", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedExchange, loadStatsForExchange]);

  const closePanel = () => {
    setSelectedExchange(null);
    setDetails(null);
  };

  return (
    <div className="relative w-full h-screen bg-[#020617] overflow-hidden">
      {/* Semantic Header for SEO */}
      <header className="absolute top-0 left-0 p-4 md:p-6 z-10 pointer-events-none w-full md:w-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter drop-shadow-md">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-cyan-300">Global</span> Exchanges
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mt-2 drop-shadow-sm">
          Explore the world's markets in 3D, built by{' '}
          <a 
            href="https://x.com/zway_ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative inline-block pointer-events-auto group"
          >
            <span className="text-gray-400 transition-opacity duration-300 ease-in-out group-hover:opacity-0">
              @zway
            </span>
            <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-cyan-300 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
              @zway
            </span>
          </a>
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

      {/* Semantic Legend Section - REMOVED per user request */}


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
              <p><strong>Monthly Value Traded:</strong> ${ex.monthlyTradeValueBillionUSD} Billion USD</p>
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
            stats={statsByExchange[selectedExchange.id]}
            statsMeta={statsMeta}
            statsLoading={statsLoadingExchange === selectedExchange.id && !statsByExchange[selectedExchange.id]}
            statsError={statsError}
            onClose={closePanel}
          />
        </aside>
      )}
      
      {/* Financial Ticker */}
      <Ticker />
    </div>
  );
};

export default App;