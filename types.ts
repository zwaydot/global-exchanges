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
