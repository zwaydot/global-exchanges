import React, { useEffect, useState, useRef } from 'react';
import { STOCK_EXCHANGES } from '../constants';
import { Exchange } from '../types';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRect?: DOMRect | null; // 按钮的位置和尺寸信息
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, buttonRect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger entry animation
      requestAnimationFrame(() => {
        setShowContent(true);
      });
    } else {
      setShowContent(false);
      // Wait for exit animation
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  // Sort exchanges by market cap (descending)
  const sortedExchanges = [...STOCK_EXCHANGES].sort(
    (a, b) => b.marketCapTrillionUSD - a.marketCapTrillionUSD
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className={`relative w-[95vw] md:w-full md:max-w-4xl h-[80vh] md:h-auto md:max-h-[80vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) transform ${
          showContent 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-800 bg-slate-900/50 relative z-20">
          <div className="flex items-center gap-2">
            <LeaderboardIcon className="w-4 h-4 text-amber-400" />
            <h2 className="text-base md:text-lg font-semibold text-white">Global Exchange Rankings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            aria-label="Close leaderboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto relative z-20 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-slate-800/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
              <tr>
                <th className="p-2 md:p-4 font-medium text-slate-300 whitespace-nowrap">Rank</th>
                <th className="p-2 md:p-4 font-medium text-slate-300 whitespace-nowrap">Exchange</th>
                <th className="p-2 md:p-4 font-medium text-slate-300 text-right whitespace-nowrap">
                  Market Cap
                  <span className="text-[10px] md:text-xs text-slate-500 font-normal ml-1">(Trillion USD)</span>
                </th>
                <th className="p-2 md:p-4 font-medium text-slate-300 text-right hidden sm:table-cell whitespace-nowrap">
                  Monthly Vol
                  <span className="text-[10px] md:text-xs text-slate-500 font-normal ml-1">(Billion USD)</span>
                </th>
                <th className="p-2 md:p-4 font-medium text-slate-300 text-right hidden md:table-cell whitespace-nowrap">
                  Companies
                  <span className="text-[10px] md:text-xs text-slate-500 font-normal ml-1">(Count)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedExchanges.map((ex, index) => (
                <tr 
                  key={ex.id} 
                  className="hover:bg-slate-800/50 transition-colors group/row"
                  style={{
                    animation: showContent ? `slideUpFade 0.5s ease-out forwards` : 'none',
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0, // Start invisible for animation
                    transform: 'translateY(10px)'
                  }}
                >
                  <td className="p-2 md:p-4 text-slate-400 font-mono w-12 md:w-16 group-hover/row:text-amber-400 transition-colors">
                    {index === 0 ? (
                      <span className="text-2xl" title="🥇 第 1 名">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-2xl" title="🥈 第 2 名">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-2xl" title="🥉 第 3 名">🥉</span>
                    ) : (
                      `#${index + 1}`
                    )}
                  </td>
                  <td className="p-2 md:p-4">
                    <div className="font-medium text-white group-hover/row:text-amber-200 transition-colors">{ex.name}</div>
                    <div className="text-[10px] md:text-xs text-slate-500">{ex.city}, {ex.country}</div>
                  </td>
                  <td className="p-2 md:p-4 text-right font-mono text-amber-200/80 group-hover/row:text-amber-200">
                    {ex.marketCapTrillionUSD > 0 
                      ? `$${ex.marketCapTrillionUSD.toFixed(2)}T` 
                      : '-'}
                  </td>
                  <td className="p-2 md:p-4 text-right font-mono text-cyan-200/80 hidden sm:table-cell group-hover/row:text-cyan-200">
                    {ex.monthlyTradeValueBillionUSD > 0 
                      ? `$${ex.monthlyTradeValueBillionUSD.toLocaleString()}B` 
                      : '-'}
                  </td>
                  <td className="p-2 md:p-4 text-right font-mono text-slate-300/80 hidden md:table-cell group-hover/row:text-slate-300">
                    {ex.listedCompanies > 0 
                      ? ex.listedCompanies.toLocaleString() 
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-3 text-xs text-center text-slate-500 border-t border-slate-800 bg-slate-900/50 relative z-20">
          Data source: WFE Focus Market Statistics (Nov 2025)
        </div>
      </div>
      
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Custom scrollbar for better aesthetics */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.5);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.8);
        }
      `}</style>
    </div>
  );
};

export const LeaderboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M6 9H4a2 2 0 0 1 0-4h2" />
    <path d="M18 9h2a2 2 0 0 0 0-4h-2" />
    <path d="M4 22h16" />
    <path d="M10 14V20h4v-6" />
    <path d="M18 2H6v8a6 6 0 0 0 12 0V2Z" />
  </svg>
);

// Button to trigger the leaderboard
export const LeaderboardButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700 hover:border-amber-400/50 rounded-full text-slate-300 hover:text-white transition-all duration-300 shadow-lg"
      aria-label="Open Leaderboard"
    >
      <LeaderboardIcon className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
      <span className="text-sm font-medium">Rankings</span>
    </button>
  );
};
