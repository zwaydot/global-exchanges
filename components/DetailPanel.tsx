import React from 'react';
import { Exchange, ExchangeDetails, ExchangeStatsMeta, ExchangeStatsSnapshot } from '../types';
import { ExchangeSnapshot } from './ExchangeSnapshot';

interface DetailPanelProps {
  exchange: Exchange | null;
  details: ExchangeDetails | null;
  isLoading: boolean;
  stats?: ExchangeStatsSnapshot | null;
  statsMeta?: ExchangeStatsMeta | null;
  statsLoading?: boolean;
  statsError?: string | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ 
  exchange, 
  details, 
  isLoading, 
  stats,
  statsMeta,
  statsLoading = false,
  statsError,
  onClose 
}) => {
  if (!exchange) return null;

  const hasRealtimeStats = Boolean(stats);
  const tradingValue = hasRealtimeStats && stats?.monthlyTradingValueUSD != null
    ? stats.monthlyTradingValueUSD
    : exchange.monthlyTradeValueBillionUSD * 1_000_000_000;
  const marketCap = hasRealtimeStats && stats?.marketCapUSD != null
    ? stats.marketCapUSD
    : exchange.marketCapTrillionUSD * 1_000_000_000_000;
  const listedCompanies = hasRealtimeStats && stats?.listedCompanies?.total != null
    ? stats.listedCompanies.total
    : exchange.listedCompanies;

  const dataLabel = statsMeta?.periodLabel ? `As of ${statsMeta.periodLabel}` : 'Approximate values';

  return (
    <div className={`
      fixed z-50 bg-[#0B101B]/95 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8)]
      flex flex-col text-white overflow-hidden transition-transform duration-300
      
      /* Mobile: Bottom Sheet */
      inset-x-0 bottom-0 h-[65vh] rounded-t-2xl border-t border-amber-500/20
      
      /* Desktop: Right Sidebar */
      sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-96 sm:rounded-none sm:border-l sm:border-t-0
    `}>
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-start relative bg-gradient-to-b from-white/5 to-transparent shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-cyan-300 drop-shadow-sm">
            {exchange.name}
          </h2>
          <p className="text-gray-400 text-sm mt-1 tracking-wide">{exchange.city}, {exchange.country}</p>
          <p className="text-[11px] text-gray-500 mt-1">{statsLoading ? 'Updating latest stats…' : dataLabel}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-yellow-200 transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <ExchangeSnapshot exchangeName={exchange.name} />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard 
            label="Monthly Trading Value"
            value={formatCurrency(tradingValue)}
            accent="text-amber-300"
            loading={statsLoading && !stats}
            change={stats?.tradingValueChangeMoM}
          />
          <StatCard 
            label="Total Market Cap"
            value={formatCurrency(marketCap)}
            accent="text-blue-300"
            loading={statsLoading && !stats}
            change={stats?.marketCapChangeMoM}
          />
          <StatCard 
            label="Listed Companies"
            value={listedCompanies?.toLocaleString() ?? '—'}
            accent="text-purple-300"
            loading={statsLoading && !stats}
            subValue={stats?.listedCompanies ? formatCompanyBreakdown(stats.listedCompanies) : undefined}
          />
          <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-amber-500/30 transition-colors">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Currency</p>
            <p className="text-lg font-semibold text-emerald-300">{exchange.currency}</p>
          </div>
        </div>

        {statsError && (
          <div className="text-xs text-red-300 mb-4 bg-red-500/10 border border-red-400/30 rounded-md px-3 py-2">
            {statsError}
          </div>
        )}

        <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-amber-500/30 transition-colors mb-8">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Trading Hours</p>
          <p className="text-sm font-semibold text-yellow-400">
            {isLoading ? '...' : details?.tradingHours || 'N/A'}
          </p>
        </div>

        {/* AI Section */}
        <div className="space-y-6 pb-6">
          <div className="flex items-center gap-2 mb-2">
             <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}></div>
             <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Gemini Insights</h3>
          </div>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
              <div className="space-y-2 mt-6">
                 <div className="h-3 bg-white/10 rounded w-1/2"></div>
                 <div className="h-3 bg-white/10 rounded w-2/3"></div>
              </div>
            </div>
          ) : details ? (
            <>
              <div className="prose prose-invert prose-sm">
                <p className="text-gray-300 leading-relaxed">
                  {details.description}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm font-semibold text-amber-100 mb-3 border-b border-white/10 pb-2">Key Facts</h4>
                <ul className="space-y-2">
                  {details.keyFacts.map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="text-red-400 text-sm">Failed to load details.</div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-[#050a14] text-xs text-gray-600 text-center shrink-0">
        Data from WFE Focus monthly statistics. Stored in Cloudflare KV.
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  accent: string;
  loading?: boolean;
  change?: number | null;
  subValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, accent, loading, change, subValue }) => {
  return (
    <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-amber-500/30 transition-colors min-h-[72px]">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      {loading ? (
        <div className="mt-2 h-5 bg-white/10 rounded animate-pulse" />
      ) : (
        <>
          <p className={`text-lg font-semibold ${accent}`}>{value}</p>
          {subValue && <p className="text-[11px] text-gray-400 mt-1">{subValue}</p>}
          {typeof change === 'number' && (
            <p className={`text-[11px] mt-1 ${change >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}% MoM
            </p>
          )}
        </>
      )}
    </div>
  );
};

function formatCurrency(value?: number | null): string {
  if (value == null) return '—';
  const trillion = 1_000_000_000_000;
  const billion = 1_000_000_000;
  if (value >= trillion) {
    return `$${(value / trillion).toFixed(2)}T`;
  }
  if (value >= billion) {
    return `$${(value / billion).toFixed(2)}B`;
  }
  return `$${value.toLocaleString()}`;
}

function formatCompanyBreakdown(snapshot: NonNullable<ExchangeStatsSnapshot['listedCompanies']>) {
  const domestic = snapshot.domestic != null ? snapshot.domestic.toLocaleString() : '—';
  const foreign = snapshot.foreign != null ? snapshot.foreign.toLocaleString() : '—';
  return `Domestic ${domestic} • Foreign ${foreign}`;
}

export default DetailPanel;