import { ExchangeStatsMeta, ExchangeStatsSnapshot } from '../types';

export interface ExchangeStatsAPIResponse {
  exchangeId: string;
  stats: ExchangeStatsSnapshot | null;
  meta: ExchangeStatsMeta;
}

export async function fetchExchangeStats(exchangeId: string): Promise<ExchangeStatsAPIResponse> {
  const query = new URLSearchParams({ exchangeId });
  const response = await fetch(`/api/exchange-stats?${query.toString()}`, {
    headers: {
      'content-type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch exchange stats (${response.status})`);
  }

  return response.json();
}

