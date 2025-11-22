export interface Exchange {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  monthlyTradeValueBillionUSD: number; // Monthly Value of Share Trading (EOB)
  marketCapTrillionUSD: number;
  listedCompanies: number;
  currency: string;
}

export interface ExchangeDetails {
  description: string;
  keyFacts: string[];
  tradingHours: string;
}

export interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  color: string;
  name: string;
  data: Exchange;
}

export interface ListedCompaniesSnapshot {
  domestic?: number | null;
  foreign?: number | null;
  total?: number | null;
}

export interface ExchangeStatsSnapshot {
  marketCapUSD?: number | null;
  marketCapChangeMoM?: number | null;
  marketCapChangeYoY?: number | null;
  monthlyTradingValueUSD?: number | null;
  tradingValueChangeMoM?: number | null;
  tradingValueChangeYoY?: number | null;
  listedCompanies?: ListedCompaniesSnapshot | null;
}

export interface ExchangeStatsMeta {
  issueSlug: string;
  issueTitle: string;
  periodLabel: string;
  extractedAt: number;
}
