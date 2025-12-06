import React, { useEffect, useState, useRef } from 'react';
import snapdom from '@zumer/snapdom';

interface SnapshotData {
  exchange: string;
  weather: {
    condition: string;
    temp: number;
    isDay?: boolean;
  };
  market: {
    indexName: string;
    price: number;
    change: number;
    changePercent: number;
    date: string;
  };
  imageUrl?: string | null;
  imageError?: string | null;
}

interface ExchangeSnapshotProps {
  exchangeName: string;
}

export const ExchangeSnapshot: React.FC<ExchangeSnapshotProps> = ({ exchangeName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [copyErrorMessage, setCopyErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Add timestamp to bypass caching
        const t = Date.now();
        const res = await fetch(`/api/generate-snapshot?exchange=${encodeURIComponent(exchangeName)}&t=${t}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({})) as { error?: string | { message: string } };
          // Handle Google-style error object or simple error string
          let msg = 'Server error';
          if (typeof errorData.error === 'string') {
            msg = errorData.error;
          } else if (errorData.error && typeof errorData.error === 'object' && 'message' in errorData.error) {
            msg = errorData.error.message;
          } else {
            msg = `Server error: ${res.status}`;
          }
          throw new Error(msg);
        }
        
        const json = await res.json();
        console.log('[ExchangeSnapshot] Received data:', json);
        console.log('[ExchangeSnapshot] Market data:', json.market);
        if (mounted) setData(json);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Could not load snapshot');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (exchangeName) {
      fetchData();
    }

    return () => { mounted = false; };
  }, [exchangeName]);

  const handleCopy = async () => {
    if (!containerRef.current || copyStatus === 'loading') return;

    setCopyStatus('loading');
    setCopyErrorMessage(null);

    try {
      // Use snapdom to capture the container
      // Note: snapdom returns a Promise<CaptureResult>, so we must await it or use the static helper
      const blob = await snapdom.toBlob(containerRef.current, { 
        type: 'image/png', 
        scale: 2, // Scale 2x for better quality
        exclude: ['.copy-btn'] // Exclude the copy button from the image
      });

      if (!blob) throw new Error('Failed to generate image');

      // Write to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyStatus('error');
      setCopyErrorMessage(err instanceof Error ? err.message : 'Failed to copy');
      setTimeout(() => {
        setCopyStatus('idle');
        setCopyErrorMessage(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="w-full aspect-[3/4] bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center p-8 mb-6 animate-pulse">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-amber-200/70 uppercase tracking-widest">Generating 3D Scene...</p>
        <p className="text-[10px] text-gray-500 mt-2 text-center">Fetching weather & market data, then rendering...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-[3/4] bg-white/5 rounded-xl border border-red-500/20 flex flex-col items-center justify-center p-8 mb-6">
        <p className="text-xs text-red-400 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-xs text-gray-400 hover:text-white underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Determine styles based on time of day
  // Default to day if undefined (retroactive compatibility)
  const isDay = data.weather.isDay !== false; 

  const textTheme = {
    title: isDay ? 'text-black' : 'text-white drop-shadow-md',
    subtitle: isDay ? 'text-[#666]' : 'text-white/80 drop-shadow-sm',
    tagBg: isDay ? 'bg-white/30 border-black/5' : 'bg-black/40 border-white/10',
    tagText: isDay ? 'text-black' : 'text-white',
    tagBorder: isDay ? 'border-black/5' : 'border-white/10',
  };

  const isPositive = data.market.change >= 0;
  // Adjust trend color for contrast: darker for day, lighter for night
  const changeColor = isPositive 
    ? (isDay ? 'text-emerald-600' : 'text-emerald-400') 
    : (isDay ? 'text-red-600' : 'text-red-400');

  return (
    <div ref={containerRef} className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-2xl mb-6 bg-black group">
      {/* Background Image - Sharp, no effects */}
      {data.imageUrl ? (
        <img 
          src={data.imageUrl} 
          alt={`${exchangeName} 3D View`} 
          className="w-full h-full object-cover"
          style={{ imageRendering: 'crisp-edges' }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-xs text-gray-500 mb-2">Image generation unavailable</span>
          {data.imageError && (
            <span className="text-[10px] text-red-400/80 max-w-full break-words px-2">
              {data.imageError.length > 100 ? data.imageError.substring(0, 100) + '...' : data.imageError}
            </span>
          )}
        </div>
      )}

      {/* Copy as Image Button */}
      <button
        onClick={handleCopy}
        disabled={copyStatus === 'loading' || copyStatus === 'success'}
        className={`copy-btn absolute bottom-4 right-4 z-30 p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
          copyStatus === 'error' 
            ? 'bg-red-500/20 border-red-500/50 text-red-200' 
            : 'bg-black/30 hover:bg-black/50 border-white/10 text-white/70 hover:text-white'
        } ${copyStatus === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : ''}`}
        title={copyErrorMessage || "Copy as image"}
      >
        {copyStatus === 'loading' ? (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : copyStatus === 'success' ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : copyStatus === 'error' ? (
           <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* Error Tooltip */}
      {copyErrorMessage && (
        <div className="absolute bottom-14 right-4 z-30 px-2 py-1 bg-red-500/90 text-white text-[10px] rounded shadow-lg backdrop-blur-sm animate-fade-in-up">
          {copyErrorMessage}
        </div>
      )}

      {/* Header Text Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 pt-4">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Line 1: Exchange Name */}
          <h2 className={`text-lg font-bold tracking-tight whitespace-nowrap transition-colors duration-300 ${textTheme.title}`}>
            {data.exchange}
          </h2>
          
          {/* Line 2: Date & Weather */}
          <div className="relative">
            <style>{`
              @keyframes shimmer {
                0% { background-position: 150% 0; }
                100% { background-position: -50% 0; }
              }
            `}</style>
            <div 
              className={`flex items-center gap-3 text-[10px] font-medium bg-clip-text text-transparent bg-gradient-to-r bg-[length:200%_auto] animate-[shimmer_2s_linear_infinite] ${
                isDay 
                  ? 'from-[#555] via-[#999] to-[#555]' 
                  : 'from-white/50 via-white to-white/50 drop-shadow-sm'
              }`}
            >
              <span>{data.market.date}</span>
              <span>•</span>
              <span>{data.weather.condition} {data.weather.temp}°C</span>
            </div>
          </div>
          
          {/* Line 3: Index Data - Liquid Glass Effect */}
          <div className={`flex items-center gap-1.5 text-[10px] backdrop-blur-md px-2.5 py-0.5 rounded-full border transition-all duration-300 ${textTheme.tagBg} ${textTheme.tagBorder}`}>
            <span className={`font-medium ${textTheme.tagText}`}>
              {data.market.indexName}: {data.market.price > 0 ? data.market.price.toLocaleString() : 'Loading...'}
            </span>
            {data.market.price > 0 && (
              <span className={`font-bold ${changeColor}`}>
                ({isPositive ? '+' : ''}{data.market.changePercent.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

