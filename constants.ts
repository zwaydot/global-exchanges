import { Exchange } from './types';

// Major global stock exchanges with approximate location and volume stats
// Volume estimates based on approx 2024/2025 average daily turnover
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
    dailyVolumeBillionUSD: 200,
    marketCapTrillionUSD: 26,
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
    dailyVolumeBillionUSD: 250,
    marketCapTrillionUSD: 23,
    currency: 'USD'
  },
  {
    id: 'tsx',
    name: 'Toronto Stock Exchange',
    city: 'Toronto',
    country: 'Canada',
    lat: 43.648,
    lng: -79.379,
    dailyVolumeBillionUSD: 9,
    marketCapTrillionUSD: 3.2,
    currency: 'CAD'
  },
  {
    id: 'b3',
    name: 'B3',
    city: 'São Paulo',
    country: 'Brazil',
    lat: -23.550,
    lng: -46.633,
    dailyVolumeBillionUSD: 4,
    marketCapTrillionUSD: 0.9,
    currency: 'BRL'
  },
  {
    id: 'bmv',
    name: 'Bolsa Mexicana de Valores',
    city: 'Mexico City',
    country: 'Mexico',
    lat: 19.432,
    lng: -99.133,
    dailyVolumeBillionUSD: 1.2,
    marketCapTrillionUSD: 0.5,
    currency: 'MXN'
  },
  {
    id: 'santiago',
    name: 'Santiago Stock Exchange',
    city: 'Santiago',
    country: 'Chile',
    lat: -33.448,
    lng: -70.669,
    dailyVolumeBillionUSD: 0.8,
    marketCapTrillionUSD: 0.2,
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
    dailyVolumeBillionUSD: 8,
    marketCapTrillionUSD: 3.6,
    currency: 'GBP'
  },
  {
    id: 'euronext',
    name: 'Euronext',
    city: 'Amsterdam/Paris',
    country: 'Europe',
    lat: 52.369,
    lng: 4.893,
    dailyVolumeBillionUSD: 14,
    marketCapTrillionUSD: 6.8,
    currency: 'EUR'
  },
  {
    id: 'fwb',
    name: 'Frankfurt Stock Exchange',
    city: 'Frankfurt',
    country: 'Germany',
    lat: 50.115,
    lng: 8.678,
    dailyVolumeBillionUSD: 6,
    marketCapTrillionUSD: 2.3,
    currency: 'EUR'
  },
  {
    id: 'six',
    name: 'SIX Swiss Exchange',
    city: 'Zurich',
    country: 'Switzerland',
    lat: 47.371,
    lng: 8.526,
    dailyVolumeBillionUSD: 5,
    marketCapTrillionUSD: 1.9,
    currency: 'CHF'
  },
  {
    id: 'stockholm',
    name: 'Nasdaq Stockholm',
    city: 'Stockholm',
    country: 'Sweden',
    lat: 59.329,
    lng: 18.068,
    dailyVolumeBillionUSD: 2.5,
    marketCapTrillionUSD: 1.8,
    currency: 'SEK'
  },
  {
    id: 'bist',
    name: 'Borsa Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    lat: 41.008,
    lng: 28.978,
    dailyVolumeBillionUSD: 3.5,
    marketCapTrillionUSD: 0.3,
    currency: 'TRY'
  },
  {
    id: 'tase',
    name: 'Tel Aviv Stock Exchange',
    city: 'Tel Aviv',
    country: 'Israel',
    lat: 32.085,
    lng: 34.781,
    dailyVolumeBillionUSD: 1.0,
    marketCapTrillionUSD: 0.25,
    currency: 'ILS'
  },
  {
    id: 'tadawul',
    name: 'Saudi Exchange (Tadawul)',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    lat: 24.713,
    lng: 46.675,
    dailyVolumeBillionUSD: 2,
    marketCapTrillionUSD: 2.8,
    currency: 'SAR'
  },
  {
    id: 'adx',
    name: 'Abu Dhabi Securities Exchange',
    city: 'Abu Dhabi',
    country: 'UAE',
    lat: 24.453,
    lng: 54.377,
    dailyVolumeBillionUSD: 1.5,
    marketCapTrillionUSD: 0.8,
    currency: 'AED'
  },
  {
    id: 'jse',
    name: 'Johannesburg Stock Exchange',
    city: 'Johannesburg',
    country: 'South Africa',
    lat: -26.100,
    lng: 28.053,
    dailyVolumeBillionUSD: 1.5,
    marketCapTrillionUSD: 1.0,
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
    dailyVolumeBillionUSD: 28,
    marketCapTrillionUSD: 6.0,
    currency: 'JPY'
  },
  {
    id: 'sse',
    name: 'Shanghai Stock Exchange',
    city: 'Shanghai',
    country: 'China',
    lat: 31.238,
    lng: 121.505,
    dailyVolumeBillionUSD: 65,
    marketCapTrillionUSD: 7.2,
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
    dailyVolumeBillionUSD: 75,
    marketCapTrillionUSD: 4.5,
    currency: 'CNY'
  },
  {
    id: 'hkex',
    name: 'Hong Kong Stock Exchange',
    city: 'Hong Kong',
    country: 'Hong Kong',
    lat: 22.282,
    lng: 114.158,
    dailyVolumeBillionUSD: 18,
    marketCapTrillionUSD: 4.0,
    currency: 'HKD'
  },
  {
    id: 'krx',
    name: 'Korea Exchange',
    city: 'Seoul',
    country: 'South Korea',
    lat: 37.566,
    lng: 126.978,
    dailyVolumeBillionUSD: 10,
    marketCapTrillionUSD: 1.8,
    currency: 'KRW'
  },
  {
    id: 'twse',
    name: 'Taiwan Stock Exchange',
    city: 'Taipei',
    country: 'Taiwan',
    lat: 25.033,
    lng: 121.565,
    dailyVolumeBillionUSD: 9,
    marketCapTrillionUSD: 1.7,
    currency: 'TWD'
  },
  {
    id: 'nse',
    name: 'National Stock Exchange',
    city: 'Mumbai',
    country: 'India',
    lat: 19.076,
    lng: 72.877,
    dailyVolumeBillionUSD: 12,
    marketCapTrillionUSD: 4.5,
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
    dailyVolumeBillionUSD: 0.6,
    marketCapTrillionUSD: 1.5,
    currency: 'INR'
  },
  {
    id: 'sgx',
    name: 'Singapore Exchange',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.283,
    lng: 103.850,
    dailyVolumeBillionUSD: 1.2,
    marketCapTrillionUSD: 0.6,
    currency: 'SGD'
  },
  {
    id: 'idx',
    name: 'Indonesia Stock Exchange',
    city: 'Jakarta',
    country: 'Indonesia',
    lat: -6.208,
    lng: 106.845,
    dailyVolumeBillionUSD: 0.9,
    marketCapTrillionUSD: 0.6,
    currency: 'IDR'
  },
  {
    id: 'set',
    name: 'Stock Exchange of Thailand',
    city: 'Bangkok',
    country: 'Thailand',
    lat: 13.756,
    lng: 100.501,
    dailyVolumeBillionUSD: 1.5,
    marketCapTrillionUSD: 0.5,
    currency: 'THB'
  },
  {
    id: 'bursa',
    name: 'Bursa Malaysia',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    lat: 3.139,
    lng: 101.686,
    dailyVolumeBillionUSD: 0.7,
    marketCapTrillionUSD: 0.3,
    currency: 'MYR'
  },
  {
    id: 'hose',
    name: 'Ho Chi Minh Stock Exchange',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    lat: 10.823,
    lng: 106.629,
    dailyVolumeBillionUSD: 0.8,
    marketCapTrillionUSD: 0.2,
    currency: 'VND'
  },
  {
    id: 'asx',
    name: 'Australian Securities Exchange',
    city: 'Sydney',
    country: 'Australia',
    lat: -33.864,
    lng: 151.210,
    dailyVolumeBillionUSD: 4.5,
    marketCapTrillionUSD: 1.7,
    currency: 'AUD'
  }
];
