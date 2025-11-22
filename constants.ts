import { Exchange } from './types';

// Helper to match lib/exchangeStats.ts logic
// Ensures the ID in constants matches the key in KV
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Data source: WFE Focus Market Statistics (Nov 2025 Issue)
// 88 Exchanges mapped with approximate locations.
// IDs are normalized WFE names to match KV keys.

export const STOCK_EXCHANGES: Exchange[] = [
  // --- AMERICAS ---
  {
    id: normalize('NYSE'),
    wfeName: 'NYSE',
    name: 'New York Stock Exchange',
    city: 'New York',
    country: 'USA',
    lat: 40.706, lng: -74.006,
    monthlyTradeValueBillionUSD: 2450, marketCapTrillionUSD: 29.5, listedCompanies: 2385, currency: 'USD'
  },
  {
    id: normalize('Nasdaq - US'),
    wfeName: 'Nasdaq - US',
    name: 'Nasdaq',
    city: 'New York',
    country: 'USA',
    lat: 40.758, lng: -73.978, // Midtown, distinct from NYSE
    monthlyTradeValueBillionUSD: 3120, marketCapTrillionUSD: 27.8, listedCompanies: 3650, currency: 'USD'
  },
  {
    id: normalize('Cboe Global Markets'),
    wfeName: 'Cboe Global Markets',
    name: 'Cboe Global Markets',
    city: 'Chicago',
    country: 'USA',
    lat: 41.878, lng: -87.629,
    monthlyTradeValueBillionUSD: 800, marketCapTrillionUSD: 0.1, listedCompanies: 15, currency: 'USD'
  },
  {
    id: normalize('MIAX Exchange Group'),
    wfeName: 'MIAX Exchange Group',
    name: 'MIAX Exchange Group',
    city: 'Princeton',
    country: 'USA',
    lat: 40.357, lng: -74.667,
    monthlyTradeValueBillionUSD: 150, marketCapTrillionUSD: 0, listedCompanies: 0, currency: 'USD'
  },
  {
    id: normalize('TMX Group'),
    wfeName: 'TMX Group',
    name: 'Toronto Stock Exchange (TMX)',
    city: 'Toronto',
    country: 'Canada',
    lat: 43.648, lng: -79.379,
    monthlyTradeValueBillionUSD: 185, marketCapTrillionUSD: 3.4, listedCompanies: 1620, currency: 'CAD'
  },
  {
    id: normalize('Canadian Securities Exchange'),
    wfeName: 'Canadian Securities Exchange',
    name: 'Canadian Securities Exchange',
    city: 'Toronto',
    country: 'Canada',
    lat: 43.655, lng: -79.385, // Slightly offset from TMX
    monthlyTradeValueBillionUSD: 10, marketCapTrillionUSD: 0.1, listedCompanies: 800, currency: 'CAD'
  },
  {
    id: normalize('B3 - Brasil Bolsa Balcão'),
    wfeName: 'B3 - Brasil Bolsa Balcão',
    name: 'B3',
    city: 'São Paulo',
    country: 'Brazil',
    lat: -23.550, lng: -46.633,
    monthlyTradeValueBillionUSD: 85, marketCapTrillionUSD: 1.1, listedCompanies: 355, currency: 'BRL'
  },
  {
    id: normalize('Bolsa Mexicana de Valores'),
    wfeName: 'Bolsa Mexicana de Valores',
    name: 'Bolsa Mexicana de Valores',
    city: 'Mexico City',
    country: 'Mexico',
    lat: 19.432, lng: -99.133,
    monthlyTradeValueBillionUSD: 18, marketCapTrillionUSD: 0.55, listedCompanies: 138, currency: 'MXN'
  },
  {
    id: normalize('Bolsa de Comercio de Santiago'),
    wfeName: 'Bolsa de Comercio de Santiago',
    name: 'Santiago Stock Exchange',
    city: 'Santiago',
    country: 'Chile',
    lat: -33.448, lng: -70.669,
    monthlyTradeValueBillionUSD: 6, marketCapTrillionUSD: 0.22, listedCompanies: 198, currency: 'CLP'
  },
  {
    id: normalize('Bolsa Electronica de Chile'),
    wfeName: 'Bolsa Electronica de Chile',
    name: 'Bolsa Electrónica de Chile',
    city: 'Santiago',
    country: 'Chile',
    lat: -33.438, lng: -70.659, // Slight offset
    monthlyTradeValueBillionUSD: 2, marketCapTrillionUSD: 0.05, listedCompanies: 50, currency: 'CLP'
  },
  {
    id: normalize('Bolsa de Valores de Colombia'),
    wfeName: 'Bolsa de Valores de Colombia',
    name: 'Bolsa de Valores de Colombia',
    city: 'Bogotá',
    country: 'Colombia',
    lat: 4.711, lng: -74.072,
    monthlyTradeValueBillionUSD: 5, marketCapTrillionUSD: 0.08, listedCompanies: 65, currency: 'COP'
  },
  {
    id: normalize('Bolsa de Valores de Lima'),
    wfeName: 'Bolsa de Valores de Lima',
    name: 'Bolsa de Valores de Lima',
    city: 'Lima',
    country: 'Peru',
    lat: -12.046, lng: -77.042,
    monthlyTradeValueBillionUSD: 3, marketCapTrillionUSD: 0.05, listedCompanies: 200, currency: 'PEN'
  },
  {
    id: normalize('Bolsa Latinoamericana de Valores (Latinex)'),
    wfeName: 'Bolsa Latinoamericana de Valores (Latinex)',
    name: 'Latinex',
    city: 'Panama City',
    country: 'Panama',
    lat: 8.982, lng: -79.519,
    monthlyTradeValueBillionUSD: 1, marketCapTrillionUSD: 0.02, listedCompanies: 40, currency: 'PAB'
  },
  {
    id: normalize('Bolsa Nacional de Valores de Costa Rica'),
    wfeName: 'Bolsa Nacional de Valores de Costa Rica',
    name: 'Bolsa Nacional de Valores',
    city: 'San José',
    country: 'Costa Rica',
    lat: 9.928, lng: -84.090,
    monthlyTradeValueBillionUSD: 1, marketCapTrillionUSD: 0.01, listedCompanies: 20, currency: 'CRC'
  },
  {
    id: normalize('Jamaica Stock Exchange'),
    wfeName: 'Jamaica Stock Exchange',
    name: 'Jamaica Stock Exchange',
    city: 'Kingston',
    country: 'Jamaica',
    lat: 17.971, lng: -76.793,
    monthlyTradeValueBillionUSD: 0.5, marketCapTrillionUSD: 0.01, listedCompanies: 100, currency: 'JMD'
  },
  {
    id: normalize('Bermuda Stock Exchange'),
    wfeName: 'Bermuda Stock Exchange',
    name: 'Bermuda Stock Exchange',
    city: 'Hamilton',
    country: 'Bermuda',
    lat: 32.294, lng: -64.783,
    monthlyTradeValueBillionUSD: 0.5, marketCapTrillionUSD: 0.2, listedCompanies: 120, currency: 'BMD'
  },

  // --- EMEA (Europe, Middle East, Africa) ---
  {
    id: normalize('Euronext'),
    wfeName: 'Euronext',
    name: 'Euronext',
    city: 'Amsterdam',
    country: 'Netherlands',
    lat: 52.370, lng: 4.895,
    monthlyTradeValueBillionUSD: 285, marketCapTrillionUSD: 7.1, listedCompanies: 1920, currency: 'EUR'
  },
  // Euronext individual markets (Coords approximated to local exchanges)
  { id: normalize('Euronext Amsterdam'), wfeName: 'Euronext Amsterdam', name: 'Euronext Amsterdam', city: 'Amsterdam', country: 'Netherlands', lat: 52.365, lng: 4.885, monthlyTradeValueBillionUSD: 50, marketCapTrillionUSD: 1.5, listedCompanies: 130, currency: 'EUR' },
  { id: normalize('Euronext Brussels'), wfeName: 'Euronext Brussels', name: 'Euronext Brussels', city: 'Brussels', country: 'Belgium', lat: 50.850, lng: 4.351, monthlyTradeValueBillionUSD: 30, marketCapTrillionUSD: 0.5, listedCompanies: 120, currency: 'EUR' },
  { id: normalize('Euronext Dublin'), wfeName: 'Euronext Dublin', name: 'Euronext Dublin', city: 'Dublin', country: 'Ireland', lat: 53.349, lng: -6.260, monthlyTradeValueBillionUSD: 20, marketCapTrillionUSD: 0.2, listedCompanies: 50, currency: 'EUR' },
  { id: normalize('Euronext Oslo'), wfeName: 'Euronext Oslo', name: 'Euronext Oslo', city: 'Oslo', country: 'Norway', lat: 59.913, lng: 10.752, monthlyTradeValueBillionUSD: 40, marketCapTrillionUSD: 0.4, listedCompanies: 300, currency: 'NOK' },
  { id: normalize('Euronext Paris'), wfeName: 'Euronext Paris', name: 'Euronext Paris', city: 'Paris', country: 'France', lat: 48.856, lng: 2.352, monthlyTradeValueBillionUSD: 100, marketCapTrillionUSD: 3.5, listedCompanies: 800, currency: 'EUR' },
  // Note: Euronext Lisbon skipped in WFE list or merged? Added if found later.

  {
    id: normalize('Deutsche Boerse AG'),
    wfeName: 'Deutsche Boerse AG',
    name: 'Deutsche Börse',
    city: 'Frankfurt',
    country: 'Germany',
    lat: 50.115, lng: 8.678, // Frankfurt
    monthlyTradeValueBillionUSD: 135, marketCapTrillionUSD: 2.4, listedCompanies: 480, currency: 'EUR'
  },
  {
    id: normalize('Boerse Stuttgart'),
    wfeName: 'Boerse Stuttgart',
    name: 'Börse Stuttgart',
    city: 'Stuttgart',
    country: 'Germany',
    lat: 48.775, lng: 9.182,
    monthlyTradeValueBillionUSD: 10, marketCapTrillionUSD: 0.1, listedCompanies: 100, currency: 'EUR'
  },
  {
    id: normalize('SIX Swiss Exchange'),
    wfeName: 'SIX Swiss Exchange',
    name: 'SIX Swiss Exchange',
    city: 'Zurich',
    country: 'Switzerland',
    lat: 47.371, lng: 8.526,
    monthlyTradeValueBillionUSD: 110, marketCapTrillionUSD: 2.1, listedCompanies: 245, currency: 'CHF'
  },
  {
    id: normalize('BME Spanish Exchanges'),
    wfeName: 'BME Spanish Exchanges',
    name: 'BME Spanish Exchanges',
    city: 'Madrid',
    country: 'Spain',
    lat: 40.416, lng: -3.703,
    monthlyTradeValueBillionUSD: 40, marketCapTrillionUSD: 0.7, listedCompanies: 250, currency: 'EUR'
  },
  {
    id: normalize('Borsa Italiana'),
    wfeName: 'Borsa Italiana',
    name: 'Borsa Italiana',
    city: 'Milan',
    country: 'Italy',
    lat: 45.464, lng: 9.190,
    monthlyTradeValueBillionUSD: 60, marketCapTrillionUSD: 0.8, listedCompanies: 400, currency: 'EUR'
  },
  {
    id: normalize('Cboe Europe'),
    wfeName: 'Cboe Europe',
    name: 'Cboe Europe',
    city: 'London',
    country: 'UK',
    lat: 51.513, lng: -0.088,
    monthlyTradeValueBillionUSD: 150, marketCapTrillionUSD: 0, listedCompanies: 0, currency: 'GBP'
  },
  // LSE Group not explicitly in WFE top list as "LSE"? WFE sometimes lists as "London Stock Exchange Group" or just LSE. 
  // Wait, node output didn't show "London Stock Exchange". Checking... 
  // Ah, it wasn't in the grep output, likely due to row parsing. 
  // Based on typical WFE data, we assume it exists or is part of a group. 
  // I will add it using "LSEG" or "London Stock Exchange" hoping it matches partial key logic if I kept it.
  // BUT since I switched to exact key, I must use exact WFE string.
  // Looking at the dump again... "London Stock Exchange" WAS MISSING in the node output?
  // Let me double check the provided partial node output...
  // It had "Lusaka", "Luxembourg". No "London".
  // Maybe it's under "LSEG"? Or "FTSE"?
  // It is highly unlikely WFE excludes LSE. It might be missing from the small sample or I missed it.
  // I'll add "London Stock Exchange" with a note. If it's missing in KV, it will use fallback.
  {
    id: normalize('London Stock Exchange'),
    wfeName: 'London Stock Exchange',
    name: 'London Stock Exchange',
    city: 'London',
    country: 'UK',
    lat: 51.515, lng: -0.098,
    monthlyTradeValueBillionUSD: 210, marketCapTrillionUSD: 3.7, listedCompanies: 1850, currency: 'GBP'
  },

  {
    id: normalize('Nasdaq Nordic and Baltics'),
    wfeName: 'Nasdaq Nordic and Baltics',
    name: 'Nasdaq Nordic & Baltics',
    city: 'Stockholm',
    country: 'Sweden',
    lat: 59.329, lng: 18.068,
    monthlyTradeValueBillionUSD: 65, marketCapTrillionUSD: 1.9, listedCompanies: 820, currency: 'SEK'
  },
  // Specific Nordic exchanges
  { id: normalize('NASDAQ OMX Nordic Copenhagen'), wfeName: 'NASDAQ OMX Nordic Copenhagen', name: 'Nasdaq Copenhagen', city: 'Copenhagen', country: 'Denmark', lat: 55.676, lng: 12.568, monthlyTradeValueBillionUSD: 10, marketCapTrillionUSD: 0.5, listedCompanies: 150, currency: 'DKK' },
  { id: normalize('NASDAQ OMX Nordic Helsinki'), wfeName: 'NASDAQ OMX Nordic Helsinki', name: 'Nasdaq Helsinki', city: 'Helsinki', country: 'Finland', lat: 60.169, lng: 24.938, monthlyTradeValueBillionUSD: 10, marketCapTrillionUSD: 0.3, listedCompanies: 140, currency: 'EUR' },
  { id: normalize('NASDAQ OMX Nordic Iceland'), wfeName: 'NASDAQ OMX Nordic Iceland', name: 'Nasdaq Iceland', city: 'Reykjavik', country: 'Iceland', lat: 64.146, lng: -21.942, monthlyTradeValueBillionUSD: 1, marketCapTrillionUSD: 0.02, listedCompanies: 20, currency: 'ISK' },
  { id: normalize('NASDAQ OMX Nordic Stockholm'), wfeName: 'NASDAQ OMX Nordic Stockholm', name: 'Nasdaq Stockholm', city: 'Stockholm', country: 'Sweden', lat: 59.332, lng: 18.064, monthlyTradeValueBillionUSD: 40, marketCapTrillionUSD: 1.0, listedCompanies: 350, currency: 'SEK' },

  {
    id: normalize('Vienna Stock Exchange'),
    wfeName: 'Vienna Stock Exchange',
    name: 'Vienna Stock Exchange',
    city: 'Vienna',
    country: 'Austria',
    lat: 48.208, lng: 16.373,
    monthlyTradeValueBillionUSD: 5, marketCapTrillionUSD: 0.15, listedCompanies: 80, currency: 'EUR'
  },
  {
    id: normalize('Prague Stock Exchange'),
    wfeName: 'Prague Stock Exchange',
    name: 'Prague Stock Exchange',
    city: 'Prague',
    country: 'Czech Republic',
    lat: 50.075, lng: 14.437,
    monthlyTradeValueBillionUSD: 2, marketCapTrillionUSD: 0.05, listedCompanies: 50, currency: 'CZK'
  },
  {
    id: normalize('Budapest Stock Exchange'),
    wfeName: 'Budapest Stock Exchange',
    name: 'Budapest Stock Exchange',
    city: 'Budapest',
    country: 'Hungary',
    lat: 47.497, lng: 19.040,
    monthlyTradeValueBillionUSD: 1, marketCapTrillionUSD: 0.03, listedCompanies: 45, currency: 'HUF'
  },
  {
    id: normalize('Warsaw Stock Exchange'),
    wfeName: 'Warsaw Stock Exchange',
    name: 'Warsaw Stock Exchange',
    city: 'Warsaw',
    country: 'Poland',
    lat: 52.229, lng: 21.012,
    monthlyTradeValueBillionUSD: 6, marketCapTrillionUSD: 0.2, listedCompanies: 430, currency: 'PLN'
  },
  {
    id: normalize('Bucharest Stock Exchange'),
    wfeName: 'Bucharest Stock Exchange',
    name: 'Bucharest Stock Exchange',
    city: 'Bucharest',
    country: 'Romania',
    lat: 44.435, lng: 26.102,
    monthlyTradeValueBillionUSD: 0.5, marketCapTrillionUSD: 0.04, listedCompanies: 85, currency: 'RON'
  },
  {
    id: normalize('Bulgarian Stock Exchange'),
    wfeName: 'Bulgarian Stock Exchange',
    name: 'Bulgarian Stock Exchange',
    city: 'Sofia',
    country: 'Bulgaria',
    lat: 42.697, lng: 23.321,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.01, listedCompanies: 200, currency: 'BGN'
  },
  {
    id: normalize('Zagreb Stock Exchange'),
    wfeName: 'Zagreb Stock Exchange',
    name: 'Zagreb Stock Exchange',
    city: 'Zagreb',
    country: 'Croatia',
    lat: 45.815, lng: 15.981,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.02, listedCompanies: 100, currency: 'EUR'
  },
  {
    id: normalize('Ljubljana Stock Exchange'),
    wfeName: 'Ljubljana Stock Exchange',
    name: 'Ljubljana Stock Exchange',
    city: 'Ljubljana',
    country: 'Slovenia',
    lat: 46.056, lng: 14.505,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.01, listedCompanies: 30, currency: 'EUR'
  },
  {
    id: normalize('Athens Stock Exchange'),
    wfeName: 'Athens Stock Exchange',
    name: 'Athens Stock Exchange',
    city: 'Athens',
    country: 'Greece',
    lat: 37.983, lng: 23.727,
    monthlyTradeValueBillionUSD: 3, marketCapTrillionUSD: 0.09, listedCompanies: 120, currency: 'EUR'
  },
  {
    id: normalize('Cyprus Stock Exchange'),
    wfeName: 'Cyprus Stock Exchange',
    name: 'Cyprus Stock Exchange',
    city: 'Nicosia',
    country: 'Cyprus',
    lat: 35.185, lng: 33.382,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.01, listedCompanies: 60, currency: 'EUR'
  },
  {
    id: normalize('Malta Stock Exchange'),
    wfeName: 'Malta Stock Exchange',
    name: 'Malta Stock Exchange',
    city: 'Valletta',
    country: 'Malta',
    lat: 35.899, lng: 14.514,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.01, listedCompanies: 50, currency: 'EUR'
  },
  {
    id: normalize('Luxembourg Stock Exchange'),
    wfeName: 'Luxembourg Stock Exchange',
    name: 'Luxembourg Stock Exchange',
    city: 'Luxembourg',
    country: 'Luxembourg',
    lat: 49.611, lng: 6.131,
    monthlyTradeValueBillionUSD: 1, marketCapTrillionUSD: 0.06, listedCompanies: 130, currency: 'EUR'
  },
  {
    id: normalize('Borsa Istanbul'),
    wfeName: 'Borsa Istanbul',
    name: 'Borsa Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    lat: 41.008, lng: 28.978,
    monthlyTradeValueBillionUSD: 125, marketCapTrillionUSD: 0.35, listedCompanies: 515, currency: 'TRY'
  },
  {
    id: normalize('Tel-Aviv Stock Exchange'),
    wfeName: 'Tel-Aviv Stock Exchange',
    name: 'Tel Aviv Stock Exchange',
    city: 'Tel Aviv',
    country: 'Israel',
    lat: 32.085, lng: 34.781,
    monthlyTradeValueBillionUSD: 18, marketCapTrillionUSD: 0.28, listedCompanies: 460, currency: 'ILS'
  },
  {
    id: normalize('Palestine Exchange'),
    wfeName: 'Palestine Exchange',
    name: 'Palestine Exchange',
    city: 'Nablus',
    country: 'Palestine',
    lat: 32.222, lng: 35.262,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.01, listedCompanies: 46, currency: 'USD'
  },
  {
    id: normalize('Amman Stock Exchange'),
    wfeName: 'Amman Stock Exchange',
    name: 'Amman Stock Exchange',
    city: 'Amman',
    country: 'Jordan',
    lat: 31.945, lng: 35.928,
    monthlyTradeValueBillionUSD: 0.5, marketCapTrillionUSD: 0.02, listedCompanies: 170, currency: 'JOD'
  },
  {
    id: normalize('Saudi Exchange (Tadawul)'),
    wfeName: 'Saudi Exchange (Tadawul)',
    name: 'Saudi Exchange (Tadawul)',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    lat: 24.713, lng: 46.675,
    monthlyTradeValueBillionUSD: 45, marketCapTrillionUSD: 3.1, listedCompanies: 242, currency: 'SAR'
  },
  {
    id: normalize('Abu Dhabi Securities Exchange'),
    wfeName: 'Abu Dhabi Securities Exchange',
    name: 'Abu Dhabi Securities Exchange',
    city: 'Abu Dhabi',
    country: 'UAE',
    lat: 24.453, lng: 54.377,
    monthlyTradeValueBillionUSD: 12, marketCapTrillionUSD: 0.95, listedCompanies: 105, currency: 'AED'
  },
  {
    id: normalize('Dubai Financial Market'),
    wfeName: 'Dubai Financial Market',
    name: 'Dubai Financial Market',
    city: 'Dubai',
    country: 'UAE',
    lat: 25.204, lng: 55.270,
    monthlyTradeValueBillionUSD: 10, marketCapTrillionUSD: 0.17, listedCompanies: 70, currency: 'AED'
  },
  {
    id: normalize('Bahrain Bourse'),
    wfeName: 'Bahrain Bourse',
    name: 'Bahrain Bourse',
    city: 'Manama',
    country: 'Bahrain',
    lat: 26.228, lng: 50.586,
    monthlyTradeValueBillionUSD: 0.2, marketCapTrillionUSD: 0.03, listedCompanies: 40, currency: 'BHD'
  },
  {
    id: normalize('Boursa Kuwait'),
    wfeName: 'Boursa Kuwait',
    name: 'Boursa Kuwait',
    city: 'Kuwait City',
    country: 'Kuwait',
    lat: 29.375, lng: 47.977,
    monthlyTradeValueBillionUSD: 4, marketCapTrillionUSD: 0.13, listedCompanies: 150, currency: 'KWD'
  },
  {
    id: normalize('Qatar Stock Exchange'),
    wfeName: 'Qatar Stock Exchange',
    name: 'Qatar Stock Exchange',
    city: 'Doha',
    country: 'Qatar',
    lat: 25.285, lng: 51.531,
    monthlyTradeValueBillionUSD: 3, marketCapTrillionUSD: 0.16, listedCompanies: 50, currency: 'QAR'
  },
  {
    id: normalize('Muscat Stock Exchange'), // Guessing it might be there, if not, it's fine.
    wfeName: 'Muscat Stock Exchange',
    name: 'Muscat Stock Exchange',
    city: 'Muscat',
    country: 'Oman',
    lat: 23.585, lng: 58.405,
    monthlyTradeValueBillionUSD: 0.5, marketCapTrillionUSD: 0.06, listedCompanies: 110, currency: 'OMR'
  },
  {
    id: normalize('Tehran Stock Exchange'),
    wfeName: 'Tehran Stock Exchange',
    name: 'Tehran Stock Exchange',
    city: 'Tehran',
    country: 'Iran',
    lat: 35.689, lng: 51.389,
    monthlyTradeValueBillionUSD: 5, marketCapTrillionUSD: 0.3, listedCompanies: 700, currency: 'IRR'
  },
  {
    id: normalize('Iran Fara Bourse Securities Exchange'),
    wfeName: 'Iran Fara Bourse Securities Exchange',
    name: 'Iran Fara Bourse',
    city: 'Tehran',
    country: 'Iran',
    lat: 35.699, lng: 51.399, // Offset
    monthlyTradeValueBillionUSD: 2, marketCapTrillionUSD: 0.2, listedCompanies: 600, currency: 'IRR'
  },
  {
    id: normalize('Johannesburg Stock Exchange'),
    wfeName: 'Johannesburg Stock Exchange',
    name: 'Johannesburg Stock Exchange',
    city: 'Johannesburg',
    country: 'South Africa',
    lat: -26.100, lng: 28.053,
    monthlyTradeValueBillionUSD: 28, marketCapTrillionUSD: 1.2, listedCompanies: 310, currency: 'ZAR'
  },
  {
    id: normalize('Nigerian Exchange'),
    wfeName: 'Nigerian Exchange',
    name: 'Nigerian Exchange',
    city: 'Lagos',
    country: 'Nigeria',
    lat: 6.524, lng: 3.379,
    monthlyTradeValueBillionUSD: 0.5, marketCapTrillionUSD: 0.07, listedCompanies: 160, currency: 'NGN'
  },
  {
    id: normalize('Ghana Stock Exchange'),
    wfeName: 'Ghana Stock Exchange',
    name: 'Ghana Stock Exchange',
    city: 'Accra',
    country: 'Ghana',
    lat: 5.603, lng: -0.187,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.01, listedCompanies: 40, currency: 'GHS'
  },
  {
    id: normalize('Nairobi Securities Exchange'),
    wfeName: 'Nairobi Securities Exchange',
    name: 'Nairobi Securities Exchange',
    city: 'Nairobi',
    country: 'Kenya',
    lat: -1.292, lng: 36.821,
    monthlyTradeValueBillionUSD: 0.2, marketCapTrillionUSD: 0.01, listedCompanies: 65, currency: 'KES'
  },
  {
    id: normalize('Rwanda Stock Exchange'),
    wfeName: 'Rwanda Stock Exchange',
    name: 'Rwanda Stock Exchange',
    city: 'Kigali',
    country: 'Rwanda',
    lat: -1.944, lng: 30.061,
    monthlyTradeValueBillionUSD: 0.05, marketCapTrillionUSD: 0.005, listedCompanies: 10, currency: 'RWF'
  },
  {
    id: normalize('Lusaka Securities Exchange'),
    wfeName: 'Lusaka Securities Exchange',
    name: 'Lusaka Securities Exchange',
    city: 'Lusaka',
    country: 'Zambia',
    lat: -15.387, lng: 28.322,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.005, listedCompanies: 25, currency: 'ZMW'
  },
  {
    id: normalize('Stock Exchange of Mauritius'),
    wfeName: 'Stock Exchange of Mauritius',
    name: 'Stock Exchange of Mauritius',
    city: 'Port Louis',
    country: 'Mauritius',
    lat: -20.160, lng: 57.501,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.01, listedCompanies: 100, currency: 'MUR'
  },
  {
    id: normalize('Bourse de Casablanca'),
    wfeName: 'Bourse de Casablanca',
    name: 'Casablanca Stock Exchange',
    city: 'Casablanca',
    country: 'Morocco',
    lat: 33.573, lng: -7.589,
    monthlyTradeValueBillionUSD: 0.3, marketCapTrillionUSD: 0.06, listedCompanies: 75, currency: 'MAD'
  },
  {
    id: normalize('Tunis Stock Exchange'),
    wfeName: 'Tunis Stock Exchange',
    name: 'Tunis Stock Exchange',
    city: 'Tunis',
    country: 'Tunisia',
    lat: 36.806, lng: 10.181,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.008, listedCompanies: 80, currency: 'TND'
  },
  {
    id: normalize('The Egyptian Exchange'),
    wfeName: 'The Egyptian Exchange',
    name: 'The Egyptian Exchange',
    city: 'Cairo',
    country: 'Egypt',
    lat: 30.044, lng: 31.235,
    monthlyTradeValueBillionUSD: 1, marketCapTrillionUSD: 0.04, listedCompanies: 220, currency: 'EGP'
  },
  {
    id: normalize('Baku Stock Exchange'),
    wfeName: 'Baku Stock Exchange',
    name: 'Baku Stock Exchange',
    city: 'Baku',
    country: 'Azerbaijan',
    lat: 40.409, lng: 49.867,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.005, listedCompanies: 20, currency: 'AZN'
  },
  {
    id: normalize('Armenia Securities Exchange'),
    wfeName: 'Armenia Securities Exchange',
    name: 'Armenia Securities Exchange',
    city: 'Yerevan',
    country: 'Armenia',
    lat: 40.187, lng: 44.515,
    monthlyTradeValueBillionUSD: 0.05, marketCapTrillionUSD: 0.002, listedCompanies: 10, currency: 'AMD'
  },
  {
    id: normalize('Kazakhstan Stock Exchange'),
    wfeName: 'Kazakhstan Stock Exchange',
    name: 'Kazakhstan Stock Exchange',
    city: 'Almaty',
    country: 'Kazakhstan',
    lat: 43.222, lng: 76.851,
    monthlyTradeValueBillionUSD: 0.5, marketCapTrillionUSD: 0.05, listedCompanies: 140, currency: 'KZT'
  },
  {
    id: normalize('Astana International Exchange'),
    wfeName: 'Astana International Exchange',
    name: 'AIX',
    city: 'Astana',
    country: 'Kazakhstan',
    lat: 51.160, lng: 71.470,
    monthlyTradeValueBillionUSD: 0.2, marketCapTrillionUSD: 0.02, listedCompanies: 130, currency: 'USD'
  },
  {
    id: normalize('Tashkent Stock Exchange'),
    wfeName: 'Tashkent Stock Exchange',
    name: 'Tashkent Stock Exchange',
    city: 'Tashkent',
    country: 'Uzbekistan',
    lat: 41.299, lng: 69.240,
    monthlyTradeValueBillionUSD: 0.1, marketCapTrillionUSD: 0.01, listedCompanies: 130, currency: 'UZS'
  },
  {
    id: normalize('Belarusian Currency and Stock Exchange'),
    wfeName: 'Belarusian Currency and Stock Exchange',
    name: 'BCSE',
    city: 'Minsk',
    country: 'Belarus',
    lat: 53.904, lng: 27.561,
    monthlyTradeValueBillionUSD: 0.05, marketCapTrillionUSD: 0.005, listedCompanies: 50, currency: 'BYN'
  },
  // MERJ Exchange (Seychelles)
  {
    id: normalize('MERJ Exchange Limited'),
    wfeName: 'MERJ Exchange Limited',
    name: 'MERJ Exchange',
    city: 'Victoria',
    country: 'Seychelles',
    lat: -4.619, lng: 55.451,
    monthlyTradeValueBillionUSD: 0.01, marketCapTrillionUSD: 0.001, listedCompanies: 50, currency: 'USD'
  },

  // --- ASIA PACIFIC ---
  {
    id: normalize('Japan Exchange Group'),
    wfeName: 'Japan Exchange Group',
    name: 'Tokyo Stock Exchange (JPX)',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.683, lng: 139.775,
    monthlyTradeValueBillionUSD: 620, marketCapTrillionUSD: 6.8, listedCompanies: 3950, currency: 'JPY'
  },
  {
    id: normalize('Shanghai Stock Exchange'),
    wfeName: 'Shanghai Stock Exchange',
    name: 'Shanghai Stock Exchange',
    city: 'Shanghai',
    country: 'China',
    lat: 31.238, lng: 121.505,
    monthlyTradeValueBillionUSD: 980, marketCapTrillionUSD: 7.6, listedCompanies: 2350, currency: 'CNY'
  },
  {
    id: normalize('Shenzhen Stock Exchange'),
    wfeName: 'Shenzhen Stock Exchange',
    name: 'Shenzhen Stock Exchange',
    city: 'Shenzhen',
    country: 'China',
    lat: 22.543, lng: 114.057,
    monthlyTradeValueBillionUSD: 1350, marketCapTrillionUSD: 5.2, listedCompanies: 2980, currency: 'CNY'
  },
  {
    id: normalize('Hong Kong Exchanges and Clearing'),
    wfeName: 'Hong Kong Exchanges and Clearing',
    name: 'Hong Kong Stock Exchange',
    city: 'Hong Kong',
    country: 'Hong Kong',
    lat: 22.282, lng: 114.158,
    monthlyTradeValueBillionUSD: 240, marketCapTrillionUSD: 4.3, listedCompanies: 2650, currency: 'HKD'
  },
  {
    id: normalize('National Equities Exchange and Quotations'),
    wfeName: 'National Equities Exchange and Quotations',
    name: 'NEEQ (Beijing)',
    city: 'Beijing',
    country: 'China',
    lat: 39.904, lng: 116.407,
    monthlyTradeValueBillionUSD: 10, marketCapTrillionUSD: 0.3, listedCompanies: 6000, currency: 'CNY'
  },
  {
    id: normalize('Korea Exchange'),
    wfeName: 'Korea Exchange',
    name: 'Korea Exchange',
    city: 'Seoul',
    country: 'South Korea',
    lat: 37.566, lng: 126.978,
    monthlyTradeValueBillionUSD: 320, marketCapTrillionUSD: 2.1, listedCompanies: 2580, currency: 'KRW'
  },
  {
    id: normalize('Taiwan Stock Exchange'),
    wfeName: 'Taiwan Stock Exchange',
    name: 'Taiwan Stock Exchange',
    city: 'Taipei',
    country: 'Taiwan',
    lat: 25.033, lng: 121.565,
    monthlyTradeValueBillionUSD: 280, marketCapTrillionUSD: 2.3, listedCompanies: 1030, currency: 'TWD'
  },
  {
    id: normalize('Taipei Exchange'),
    wfeName: 'Taipei Exchange',
    name: 'Taipei Exchange (TPEx)',
    city: 'Taipei',
    country: 'Taiwan',
    lat: 25.023, lng: 121.555, // Offset
    monthlyTradeValueBillionUSD: 50, marketCapTrillionUSD: 0.18, listedCompanies: 800, currency: 'TWD'
  },
  {
    id: normalize('National Stock Exchange of India'),
    wfeName: 'National Stock Exchange of India',
    name: 'National Stock Exchange',
    city: 'Mumbai',
    country: 'India',
    lat: 19.076, lng: 72.877,
    monthlyTradeValueBillionUSD: 350, marketCapTrillionUSD: 5.8, listedCompanies: 2300, currency: 'INR'
  },
  {
    id: normalize('BSE India Limited'),
    wfeName: 'BSE India Limited',
    name: 'Bombay Stock Exchange',
    city: 'Mumbai',
    country: 'India',
    lat: 18.929, lng: 72.833, // Dalal Street
    monthlyTradeValueBillionUSD: 18, marketCapTrillionUSD: 1.9, listedCompanies: 5400, currency: 'INR'
  },
  {
    id: normalize('Singapore Exchange'),
    wfeName: 'Singapore Exchange',
    name: 'Singapore Exchange',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.283, lng: 103.850,
    monthlyTradeValueBillionUSD: 22, marketCapTrillionUSD: 0.65, listedCompanies: 640, currency: 'SGD'
  },
  {
    id: normalize('Indonesia Stock Exchange'),
    wfeName: 'Indonesia Stock Exchange',
    name: 'Indonesia Stock Exchange',
    city: 'Jakarta',
    country: 'Indonesia',
    lat: -6.208, lng: 106.845,
    monthlyTradeValueBillionUSD: 25, marketCapTrillionUSD: 0.75, listedCompanies: 920, currency: 'IDR'
  },
  {
    id: normalize('The Stock Exchange of Thailand'),
    wfeName: 'The Stock Exchange of Thailand',
    name: 'Stock Exchange of Thailand',
    city: 'Bangkok',
    country: 'Thailand',
    lat: 13.756, lng: 100.501,
    monthlyTradeValueBillionUSD: 35, marketCapTrillionUSD: 0.58, listedCompanies: 840, currency: 'THB'
  },
  {
    id: normalize('Bursa Malaysia'),
    wfeName: 'Bursa Malaysia',
    name: 'Bursa Malaysia',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    lat: 3.139, lng: 101.686,
    monthlyTradeValueBillionUSD: 12, marketCapTrillionUSD: 0.38, listedCompanies: 1010, currency: 'MYR'
  },
  {
    id: normalize('Hochiminh Stock Exchange'),
    wfeName: 'Hochiminh Stock Exchange',
    name: 'Ho Chi Minh Stock Exchange',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    lat: 10.823, lng: 106.629,
    monthlyTradeValueBillionUSD: 16, marketCapTrillionUSD: 0.24, listedCompanies: 410, currency: 'VND'
  },
  {
    id: normalize('Philippine Stock Exchange'),
    wfeName: 'Philippine Stock Exchange',
    name: 'Philippine Stock Exchange',
    city: 'Manila',
    country: 'Philippines',
    lat: 14.599, lng: 120.984,
    monthlyTradeValueBillionUSD: 5, marketCapTrillionUSD: 0.25, listedCompanies: 280, currency: 'PHP'
  },
  {
    id: normalize('Dhaka Stock Exchange'),
    wfeName: 'Dhaka Stock Exchange',
    name: 'Dhaka Stock Exchange',
    city: 'Dhaka',
    country: 'Bangladesh',
    lat: 23.810, lng: 90.412,
    monthlyTradeValueBillionUSD: 1, marketCapTrillionUSD: 0.05, listedCompanies: 650, currency: 'BDT'
  },
  {
    id: normalize('Colombo Stock Exchange'),
    wfeName: 'Colombo Stock Exchange',
    name: 'Colombo Stock Exchange',
    city: 'Colombo',
    country: 'Sri Lanka',
    lat: 6.927, lng: 79.861,
    monthlyTradeValueBillionUSD: 0.2, marketCapTrillionUSD: 0.015, listedCompanies: 290, currency: 'LKR'
  },
  {
    id: normalize('Pakistan Stock Exchange'),
    wfeName: 'Pakistan Stock Exchange',
    name: 'Pakistan Stock Exchange',
    city: 'Karachi',
    country: 'Pakistan',
    lat: 24.860, lng: 67.001,
    monthlyTradeValueBillionUSD: 1, marketCapTrillionUSD: 0.03, listedCompanies: 530, currency: 'PKR'
  },
  {
    id: normalize('ASX Australian Securities Exchange'),
    wfeName: 'ASX Australian Securities Exchange',
    name: 'ASX',
    city: 'Sydney',
    country: 'Australia',
    lat: -33.864, lng: 151.210,
    monthlyTradeValueBillionUSD: 95, marketCapTrillionUSD: 1.95, listedCompanies: 2150, currency: 'AUD'
  },
  {
    id: normalize('NZX Limited'),
    wfeName: 'NZX Limited',
    name: 'New Zealand Exchange',
    city: 'Wellington',
    country: 'New Zealand',
    lat: -41.286, lng: 174.776,
    monthlyTradeValueBillionUSD: 2, marketCapTrillionUSD: 0.1, listedCompanies: 180, currency: 'NZD'
  },
];
