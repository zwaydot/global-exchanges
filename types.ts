export interface Exchange {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  dailyVolumeBillionUSD: number; // Approximate daily volume for visualization
  marketCapTrillionUSD: number;
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
