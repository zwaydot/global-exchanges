import React, { useEffect, useState, useRef } from 'react';
import { snapdom } from '@zumer/snapdom';
import { trackCopyImage } from '../lib/analytics';

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

// 模块级缓存：同一交易所的在途/已完成请求共用一份 Promise（避免 Strict Mode 双请求）
const snapshotPromiseCache: Record<string, Promise<SnapshotData>> = {};

export const ExchangeSnapshot: React.FC<ExchangeSnapshotProps> = ({ exchangeName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [copyErrorMessage, setCopyErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;

    const fetchSnapshot = async (): Promise<SnapshotData> => {
      const t = Date.now(); // 加时间戳防缓存
      const res = await fetch(`/api/generate-snapshot?exchange=${encodeURIComponent(exchangeName)}&t=${t}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})) as { error?: string | { message: string } };
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
      return res.json() as Promise<SnapshotData>;
    };

    const run = async () => {
      setLoading(true);
      setError(null);

      let promise: Promise<SnapshotData>;
      if (snapshotPromiseCache[exchangeName]) {
        promise = snapshotPromiseCache[exchangeName];
      } else {
        promise = fetchSnapshot().catch(err => {
          // 如果失败，清理缓存，避免下一次仍复用错误 Promise
          delete snapshotPromiseCache[exchangeName];
          throw err;
        });
        snapshotPromiseCache[exchangeName] = promise;
      }

      try {
        const json = await promise;
        if (!mounted) return;
        setData(json);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Could not load snapshot');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    if (exchangeName) run();

    // 不清空 inflightRef，Strict Mode 重挂载仍可复用
    return () => { mounted = false; };
  }, [exchangeName]);

  const handleCopy = async () => {
    if (!containerRef.current || copyStatus === 'loading') return;

    setCopyStatus('loading');
    setCopyErrorMessage(null);

    try {
      // Capture as PNG blob (force type to png to avoid svg fallback)
      const blob = await snapdom.toBlob(containerRef.current, {
        type: 'image/png',
        scale: 2,
        exclude: ['.copy-btn']
      } as any);

      if (!blob) throw new Error('Failed to generate image');

      // If snapdom still returns non-png, normalize to png
      const pngBlob = blob.type === 'image/png'
        ? blob
        : new Blob([await blob.arrayBuffer()], { type: 'image/png' });

      // 检测是否为移动端
      const isMobile = /iphone|ipad|ipod|android|mobile/i.test(navigator.userAgent);
      
      // 移动端：直接使用全屏显示方案（最可靠）
      if (isMobile) {
        const url = URL.createObjectURL(pngBlob);
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: contain; z-index: 9999; background: rgba(0,0,0,0.95); cursor: pointer; touch-action: none;';
        img.alt = '长按保存图片';
        
        // 点击或触摸关闭
        const close = () => {
          if (document.body.contains(img)) {
            document.body.removeChild(img);
            URL.revokeObjectURL(url);
          }
        };
        img.onclick = close;
        img.ontouchstart = (e) => {
          // 长按检测
          const timer = setTimeout(() => {
            // 长按超过 500ms，显示提示
            const tip = document.createElement('div');
            tip.textContent = '长按图片保存到相册';
            tip.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 12px 24px; border-radius: 8px; z-index: 10000; font-size: 14px; pointer-events: none;';
            document.body.appendChild(tip);
            setTimeout(() => {
              if (document.body.contains(tip)) {
                document.body.removeChild(tip);
              }
            }, 2000);
          }, 500);
          
          img.ontouchend = () => {
            clearTimeout(timer);
            // 短按关闭
            setTimeout(close, 100);
          };
          e.preventDefault();
        };
        
        document.body.appendChild(img);
        trackCopyImage(exchangeName);
        setCopyStatus('success');
        setCopyErrorMessage('图片已显示，长按保存');
        setTimeout(() => {
          setCopyStatus('idle');
          setCopyErrorMessage(null);
        }, 3000);
        return;
      }

      // 桌面端：尝试使用剪贴板 API
      const tryClipboard = async (): Promise<boolean> => {
        try {
          if (typeof navigator !== 'undefined' 
            && navigator.clipboard 
            && navigator.clipboard.write 
            && typeof ClipboardItem !== 'undefined') {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': pngBlob })
            ]);
            return true;
          }
        } catch (e) {
          console.debug('Clipboard write failed, using fallback:', e);
        }
        return false;
      };

      const clipboardSuccess = await tryClipboard();
      
      if (clipboardSuccess) {
        trackCopyImage(exchangeName);
        setCopyStatus('success');
        setTimeout(() => setCopyStatus('idle'), 2000);
      } else {
        // 桌面端 fallback：下载图片
        const url = URL.createObjectURL(pngBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${exchangeName || 'snapshot'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        trackCopyImage(exchangeName);
        setCopyStatus('success');
        setCopyErrorMessage('图片已下载');
        setTimeout(() => {
          setCopyStatus('idle');
          setCopyErrorMessage(null);
        }, 2000);
      }
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

  // Fallbacks for date / weather to avoid missing year or temperature
  const rawDate = data.market?.date;
  const fallbackDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const displayDate = (() => {
    if (!rawDate) return fallbackDate;
    // Normalize whitespace
    let normalized = rawDate.trim().replace(/\s+/g, ' ');
    // Check if year exists (4-digit year)
    const hasYear = /\b\d{4}\b/.test(normalized);
    if (!hasYear) {
      // Add year at the end, with comma if needed
      const year = new Date().getFullYear();
      // Check if there's a comma before adding year
      if (normalized.endsWith(',')) {
        normalized = `${normalized} ${year}`;
      } else {
        // Add comma before year for proper formatting
        normalized = `${normalized}, ${year}`;
      }
    }
    return normalized;
  })();
  const tempText = typeof data.weather.temp === 'number' && !Number.isNaN(data.weather.temp)
    ? `${data.weather.temp}°C`
    : '';
  const displayWeather = data.weather.condition
    ? tempText ? `${data.weather.condition} ${tempText}` : data.weather.condition
    : tempText || '—';

  const textTheme = {
    // 白天模式：使用深蓝灰色（slate-800），比纯黑更细腻，带微妙蓝调
    // 夜间模式：保持白色以确保对比度
    title: isDay ? 'text-[#111]' : 'text-white drop-shadow-md',
    subtitle: isDay ? 'text-[#475569]' : 'text-white/80 drop-shadow-sm',
    tagBg: isDay ? 'bg-white/30 border-slate-200/10' : 'bg-black/40 border-white/10',
    tagText: isDay ? 'text-[#111]' : 'text-white',
    tagBorder: isDay ? 'border-slate-200/10' : 'border-white/10',
  };

  const isPositive = data.market.change >= 0;
  // Adjust trend color for contrast: darker for day, lighter for night
  const changeColor = isPositive 
    ? (isDay ? 'text-emerald-600' : 'text-emerald-400') 
    : (isDay ? 'text-red-600' : 'text-red-400');

  return (
    <div ref={containerRef} className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl mb-6 bg-black group">
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
      <div className="absolute top-0 left-0 w-full z-20 p-6 pt-8">
        <div className="flex flex-col items-center text-center space-y-1.5">
          {/* Line 1: Exchange Name */}
          <h2 className={`text-xl md:text-2xl font-bold tracking-tight whitespace-nowrap transition-colors duration-300 ${textTheme.title}`}>
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
              className={`flex items-center gap-2 text-[11px] md:text-xs font-medium font-num bg-clip-text text-transparent bg-gradient-to-r bg-[length:200%_auto] animate-[shimmer_2s_linear_infinite] whitespace-nowrap ${
                isDay 
                  ? 'from-[#475569] via-[#888] to-[#475569]' 
                  : 'from-white/75 via-white to-white/75 drop-shadow-sm'
              }`}
            >
              <span>{displayDate}</span>
              <span>•</span>
              <span>{displayWeather}</span>
            </div>
          </div>
          
          {/* Line 3: Index Data - Liquid Glass Effect */}
          <div className={`flex items-center gap-1.5 text-[11px] md:text-xs font-medium font-num backdrop-blur-md px-2.5 py-0.5 rounded-full border transition-all duration-300 whitespace-nowrap ${textTheme.tagBg} ${textTheme.tagBorder}`}>
            <span className={`${textTheme.tagText} font-num`}>
              {data.market.indexName}: {data.market.price > 0 ? data.market.price.toLocaleString() : 'Loading...'}
            </span>
            {data.market.price > 0 && (
              <span className={`font-semibold font-num ${changeColor}`}>
                ({isPositive ? '+' : ''}{data.market.changePercent.toFixed(2)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

