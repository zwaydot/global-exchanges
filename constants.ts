import { Exchange } from './types';

// Major global stock exchanges with approximate location and volume stats
// Data based on Market Statistics for late 2025
export const STOCK_EXCHANGES: Exchange[] = [
  // --- AMERICAS ---
  {
    id: 'nyse',
    name: 'New York Stock Exchange',
    city: 'New York',
    country: 'USA',
    // Visually offset NYSE slightly South-West to separate from NASDAQ
    lat: 40.5, 
    lng: -74.2,
    monthlyTradeValueBillionUSD: 2450,
    marketCapTrillionUSD: 29.5,
    listedCompanies: 2385,
    currency: 'USD'
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ',
    city: 'New York',
    country: 'USA',
    // Visually offset NASDAQ slightly North-East to separate from NYSE
    lat: 41.0,
    lng: -73.5,
    monthlyTradeValueBillionUSD: 3120,
    marketCapTrillionUSD: 27.8,
    listedCompanies: 3650,
    currency: 'USD'
  },
  {
    id: 'tsx',
    name: 'Toronto Stock Exchange',
    city: 'Toronto',
    country: 'Canada',
    lat: 43.648,
    lng: -79.379,
    monthlyTradeValueBillionUSD: 185,
    marketCapTrillionUSD: 3.4,
    listedCompanies: 1620,
    currency: 'CAD'
  },
  {
    id: 'b3',
    name: 'B3',
    city: 'São Paulo',
    country: 'Brazil',
    lat: -23.550,
    lng: -46.633,
    monthlyTradeValueBillionUSD: 85,
    marketCapTrillionUSD: 1.1,
    listedCompanies: 355,
    currency: 'BRL'
  },
  {
    id: 'bmv',
    name: 'Bolsa Mexicana de Valores',
    city: 'Mexico City',
    country: 'Mexico',
    lat: 19.432,
    lng: -99.133,
    monthlyTradeValueBillionUSD: 18,
    marketCapTrillionUSD: 0.55,
    listedCompanies: 138,
    currency: 'MXN'
  },
  {
    id: 'santiago',
    name: 'Santiago Stock Exchange',
    city: 'Santiago',
    country: 'Chile',
    lat: -33.448,
    lng: -70.669,
    monthlyTradeValueBillionUSD: 6,
    marketCapTrillionUSD: 0.22,
    listedCompanies: 198,
    currency: 'CLP'
  },

  // --- EUROPE & MIDDLE EAST & AFRICA ---
  {
    id: 'lse',
    name: 'London Stock Exchange',
    city: 'London',
    country: 'UK',
    lat: 51.515,
    lng: -0.098,
    monthlyTradeValueBillionUSD: 210,
    marketCapTrillionUSD: 3.7,
    listedCompanies: 1850,
    currency: 'GBP'
  },
  {
    id: 'euronext',
    name: 'Euronext',
    city: 'Amsterdam/Paris',
    country: 'Europe',
    lat: 52.369,
    lng: 4.893,
    monthlyTradeValueBillionUSD: 285,
    marketCapTrillionUSD: 7.1,
    listedCompanies: 1920,
    currency: 'EUR'
  },
  {
    id: 'fwb',
    name: 'Frankfurt Stock Exchange',
    city: 'Frankfurt',
    country: 'Germany',
    lat: 50.115,
    lng: 8.678,
    monthlyTradeValueBillionUSD: 135,
    marketCapTrillionUSD: 2.4,
    listedCompanies: 480,
    currency: 'EUR'
  },
  {
    id: 'six',
    name: 'SIX Swiss Exchange',
    city: 'Zurich',
    country: 'Switzerland',
    lat: 47.371,
    lng: 8.526,
    monthlyTradeValueBillionUSD: 110,
    marketCapTrillionUSD: 2.1,
    listedCompanies: 245,
    currency: 'CHF'
  },
  {
    id: 'stockholm',
    name: 'Nasdaq Stockholm',
    city: 'Stockholm',
    country: 'Sweden',
    lat: 59.329,
    lng: 18.068,
    monthlyTradeValueBillionUSD: 65,
    marketCapTrillionUSD: 1.9,
    listedCompanies: 820,
    currency: 'SEK'
  },
  {
    id: 'bist',
    name: 'Borsa Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    lat: 41.008,
    lng: 28.978,
    monthlyTradeValueBillionUSD: 125,
    marketCapTrillionUSD: 0.35,
    listedCompanies: 515,
    currency: 'TRY'
  },
  {
    id: 'tase',
    name: 'Tel Aviv Stock Exchange',
    city: 'Tel Aviv',
    country: 'Israel',
    lat: 32.085,
    lng: 34.781,
    monthlyTradeValueBillionUSD: 18,
    marketCapTrillionUSD: 0.28,
    listedCompanies: 460,
    currency: 'ILS'
  },
  {
    id: 'tadawul',
    name: 'Saudi Exchange (Tadawul)',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    lat: 24.713,
    lng: 46.675,
    monthlyTradeValueBillionUSD: 45,
    marketCapTrillionUSD: 3.1,
    listedCompanies: 242,
    currency: 'SAR'
  },
  {
    id: 'adx',
    name: 'Abu Dhabi Securities Exchange',
    city: 'Abu Dhabi',
    country: 'UAE',
    lat: 24.453,
    lng: 54.377,
    monthlyTradeValueBillionUSD: 12,
    marketCapTrillionUSD: 0.95,
    listedCompanies: 105,
    currency: 'AED'
  },
  {
    id: 'jse',
    name: 'Johannesburg Stock Exchange',
    city: 'Johannesburg',
    country: 'South Africa',
    lat: -26.100,
    lng: 28.053,
    monthlyTradeValueBillionUSD: 28,
    marketCapTrillionUSD: 1.2,
    listedCompanies: 310,
    currency: 'ZAR'
  },

  // --- ASIA PACIFIC ---
  {
    id: 'tse',
    name: 'Tokyo Stock Exchange',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.683,
    lng: 139.775,
    monthlyTradeValueBillionUSD: 620,
    marketCapTrillionUSD: 6.8,
    listedCompanies: 3950,
    currency: 'JPY'
  },
  {
    id: 'sse',
    name: 'Shanghai Stock Exchange',
    city: 'Shanghai',
    country: 'China',
    lat: 31.238,
    lng: 121.505,
    monthlyTradeValueBillionUSD: 980,
    marketCapTrillionUSD: 7.6,
    listedCompanies: 2350,
    currency: 'CNY'
  },
  {
    id: 'szse',
    name: 'Shenzhen Stock Exchange',
    city: 'Shenzhen',
    country: 'China',
    // Visually offset North to separate from Hong Kong
    lat: 23.5, 
    lng: 114.05,
    monthlyTradeValueBillionUSD: 1350,
    marketCapTrillionUSD: 5.2,
    listedCompanies: 2980,
    currency: 'CNY'
  },
  {
    id: 'hkex',
    name: 'Hong Kong Stock Exchange',
    city: 'Hong Kong',
    country: 'Hong Kong',
    lat: 22.282,
    lng: 114.158,
    monthlyTradeValueBillionUSD: 240,
    marketCapTrillionUSD: 4.3,
    listedCompanies: 2650,
    currency: 'HKD'
  },
  {
    id: 'krx',
    name: 'Korea Exchange',
    city: 'Seoul',
    country: 'South Korea',
    lat: 37.566,
    lng: 126.978,
    monthlyTradeValueBillionUSD: 320,
    marketCapTrillionUSD: 2.1,
    listedCompanies: 2580,
    currency: 'KRW'
  },
  {
    id: 'twse',
    name: 'Taiwan Stock Exchange',
    city: 'Taipei',
    country: 'Taiwan',
    lat: 25.033,
    lng: 121.565,
    monthlyTradeValueBillionUSD: 280,
    marketCapTrillionUSD: 2.3,
    listedCompanies: 1030,
    currency: 'TWD'
  },
  {
    id: 'nse',
    name: 'National Stock Exchange',
    city: 'Mumbai',
    country: 'India',
    lat: 19.076,
    lng: 72.877,
    monthlyTradeValueBillionUSD: 350,
    marketCapTrillionUSD: 5.8,
    listedCompanies: 2300,
    currency: 'INR'
  },
  {
    id: 'bse',
    name: 'Bombay Stock Exchange',
    city: 'Mumbai',
    country: 'India',
    // Offset South East slightly from NSE to prevent overlap
    lat: 18.8,
    lng: 73.1,
    monthlyTradeValueBillionUSD: 18,
    marketCapTrillionUSD: 1.9,
    listedCompanies: 5400,
    currency: 'INR'
  },
  {
    id: 'sgx',
    name: 'Singapore Exchange',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.283,
    lng: 103.850,
    monthlyTradeValueBillionUSD: 22,
    marketCapTrillionUSD: 0.65,
    listedCompanies: 640,
    currency: 'SGD'
  },
  {
    id: 'idx',
    name: 'Indonesia Stock Exchange',
    city: 'Jakarta',
    country: 'Indonesia',
    lat: -6.208,
    lng: 106.845,
    monthlyTradeValueBillionUSD: 25,
    marketCapTrillionUSD: 0.75,
    listedCompanies: 920,
    currency: 'IDR'
  },
  {
    id: 'set',
    name: 'Stock Exchange of Thailand',
    city: 'Bangkok',
    country: 'Thailand',
    lat: 13.756,
    lng: 100.501,
    monthlyTradeValueBillionUSD: 35,
    marketCapTrillionUSD: 0.58,
    listedCompanies: 840,
    currency: 'THB'
  },
  {
    id: 'bursa',
    name: 'Bursa Malaysia',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    lat: 3.139,
    lng: 101.686,
    monthlyTradeValueBillionUSD: 12,
    marketCapTrillionUSD: 0.38,
    listedCompanies: 1010,
    currency: 'MYR'
  },
  {
    id: 'hose',
    name: 'Ho Chi Minh Stock Exchange',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    lat: 10.823,
    lng: 106.629,
    monthlyTradeValueBillionUSD: 16,
    marketCapTrillionUSD: 0.24,
    listedCompanies: 410,
    currency: 'VND'
  },
  {
    id: 'asx',
    name: 'Australian Securities Exchange',
    city: 'Sydney',
    country: 'Australia',
    lat: -33.864,
    lng: 151.210,
    monthlyTradeValueBillionUSD: 95,
    marketCapTrillionUSD: 1.95,
    listedCompanies: 2150,
    currency: 'AUD'
  }
];
