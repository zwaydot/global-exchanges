export interface ExchangeMapping {
  city: string;
  country: string;
  lat: number;
  lon: number;
  indexSymbol: string; // FMP symbol (e.g. ^DJI, ^IXIC)
  indexName: string; // Display name
  buildingPrompt: string; // Description for the image prompt
}

export const EXCHANGE_MAPPINGS: Record<string, ExchangeMapping> = {
  "New York Stock Exchange": {
    city: "New York",
    country: "USA",
    lat: 40.706,
    lon: -74.009,
    indexSymbol: "^DJI",
    indexName: "Dow Jones",
    buildingPrompt: "The iconic New York Stock Exchange building facade with its classic columns and large American flag draping, located on Wall Street."
  },
  "Nasdaq": {
    city: "New York",
    country: "USA",
    lat: 40.756,
    lon: -73.986,
    indexSymbol: "^IXIC",
    indexName: "Nasdaq Composite",
    buildingPrompt: "The Nasdaq MarketSite tower in Times Square with its massive cylindrical digital billboard screen displaying blue financial graphics."
  },
  "London Stock Exchange": {
    city: "London",
    country: "UK",
    lat: 51.515,
    lon: -0.098,
    indexSymbol: "^FTSE",
    indexName: "FTSE 100",
    buildingPrompt: "The modern Paternoster Square building entrance of the London Stock Exchange near St Paul's Cathedral."
  },
  "Tokyo Stock Exchange": {
    city: "Tokyo",
    country: "Japan",
    lat: 35.683,
    lon: 139.775,
    indexSymbol: "^N225",
    indexName: "Nikkei 225",
    buildingPrompt: "The Tokyo Stock Exchange building (Kabutocho) with its distinct curved glass entrance and digital ticker sign."
  },
  "Hong Kong Exchanges and Clearing": {
    city: "Hong Kong",
    country: "China",
    lat: 22.283,
    lon: 114.158,
    indexSymbol: "^HSI",
    indexName: "Hang Seng Index",
    buildingPrompt: "The Exchange Square complex in Central, Hong Kong, a modern skyscraper podium with circular windows."
  },
  "Hong Kong Stock Exchange": {
    city: "Hong Kong",
    country: "China",
    lat: 22.283,
    lon: 114.158,
    indexSymbol: "^HSI",
    indexName: "Hang Seng Index",
    buildingPrompt: "The Exchange Square complex in Central, Hong Kong, a modern skyscraper podium with circular windows."
  },
  "Shanghai Stock Exchange": {
    city: "Shanghai",
    country: "China",
    lat: 31.236,
    lon: 121.505,
    indexSymbol: "000001.SS",
    indexName: "SSE Composite",
    buildingPrompt: "The modern Shanghai Stock Exchange building in the Lujiazui financial district with its distinctive open-book architecture."
  },
  "Euronext": {
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.374,
    lon: 4.894,
    indexSymbol: "^AEX",
    indexName: "AEX Index",
    buildingPrompt: "The historic Beurs van Berlage building in Amsterdam, showing its red brick expressionist architecture."
  },
  "Toronto Stock Exchange": {
    city: "Toronto",
    country: "Canada",
    lat: 43.648,
    lon: -79.381,
    indexSymbol: "^GSPTSE",
    indexName: "S&P/TSX Composite",
    buildingPrompt: "The Exchange Tower in downtown Toronto, a modern glass skyscraper in the financial district."
  },
  "Shenzhen Stock Exchange": {
    city: "Shenzhen",
    country: "China",
    lat: 22.543,
    lon: 114.057,
    indexSymbol: "399001.SZ",
    indexName: "SZSE Component",
    buildingPrompt: "The massive Shenzhen Stock Exchange building (OMA) with its iconic floating podium lifted high above the ground."
  },
  "Deutsche Boerse": {
    city: "Frankfurt",
    country: "Germany",
    lat: 50.116,
    lon: 8.677,
    indexSymbol: "^GDAXI",
    indexName: "DAX",
    buildingPrompt: "The historic Frankfurt Stock Exchange building (Börse Frankfurt) with the famous Bull and Bear statues in front."
  },
  "Bombay Stock Exchange": {
    city: "Mumbai",
    country: "India",
    lat: 18.929,
    lon: 72.834,
    indexSymbol: "^BSESN",
    indexName: "S&P BSE SENSEX",
    buildingPrompt: "The Phiroze Jeejeebhoy Towers (BSE building) in Mumbai, a prominent landmark at Dalal Street."
  },
  "National Stock Exchange of India": {
    city: "Mumbai",
    country: "India",
    lat: 19.065,
    lon: 72.869,
    indexSymbol: "^NSEI",
    indexName: "NIFTY 50",
    buildingPrompt: "The modern glass National Stock Exchange building in Mumbai's Bandra Kurla Complex."
  },
  "SIX Swiss Exchange": {
    city: "Zurich",
    country: "Switzerland",
    lat: 47.372,
    lon: 8.528,
    indexSymbol: "^SSMI",
    indexName: "SMI",
    buildingPrompt: "The SIX Swiss Exchange building in Zurich, a modern commercial structure."
  },
  "Korea Exchange": {
    city: "Busan",
    country: "South Korea",
    lat: 35.147,
    lon: 129.061,
    indexSymbol: "^KS11",
    indexName: "KOSPI",
    buildingPrompt: "The Busan International Finance Center skyscraper which houses the Korea Exchange."
  },
  "Taiwan Stock Exchange": {
    city: "Taipei",
    country: "Taiwan",
    lat: 25.033,
    lon: 121.561,
    indexSymbol: "^TWII",
    indexName: "TAIEX",
    buildingPrompt: "The Taipei 101 tower, dominating the skyline, representing the financial center."
  },
  "B3": {
    city: "Sao Paulo",
    country: "Brazil",
    lat: -23.543,
    lon: -46.637,
    indexSymbol: "^BVSP",
    indexName: "Ibovespa",
    buildingPrompt: "The historic B3 building in downtown São Paulo with its classic architecture."
  },
  "Johannesburg Stock Exchange": {
    city: "Johannesburg",
    country: "South Africa",
    lat: -26.101,
    lon: 28.056,
    indexSymbol: "JSE.JO", // Placeholder/Approx
    indexName: "FTSE/JSE Top 40",
    buildingPrompt: "The modern Johannesburg Stock Exchange building in Sandton with its glass facade."
  },
  "Australian Securities Exchange": {
    city: "Sydney",
    country: "Australia",
    lat: -33.864,
    lon: 151.206,
    indexSymbol: "^AXJO",
    indexName: "S&P/ASX 200",
    buildingPrompt: "The Exchange Centre in Sydney near Bridge Street, a modern office tower."
  },
  "Singapore Exchange": {
    city: "Singapore",
    country: "Singapore",
    lat: 1.280,
    lon: 103.850,
    indexSymbol: "^STI",
    indexName: "Straits Times Index",
    buildingPrompt: "The SGX Centre in Shenton Way, a twin tower skyscraper complex in Singapore."
  },
  "Borsa Italiana": {
    city: "Milan",
    country: "Italy",
    lat: 45.464,
    lon: 9.185,
    indexSymbol: "FTSEMIB.MI",
    indexName: "FTSE MIB",
    buildingPrompt: "The historic Palazzo Mezzanotte in Milan, an imposing 20th-century building with a white marble facade and classical columns."
  },
  "Cboe Global Markets": {
    city: "Chicago",
    country: "USA",
    lat: 41.878,
    lon: -87.629,
    indexSymbol: "^VIX",
    indexName: "Cboe Volatility Index",
    buildingPrompt: "The Cboe Global Markets headquarters in Chicago, a modern high-rise building in the financial district."
  },
  "MIAX Exchange Group": {
    city: "Princeton",
    country: "USA",
    lat: 40.357,
    lon: -74.667,
    indexSymbol: "^GSPC", // S&P 500 as proxy for US options market
    indexName: "S&P 500",
    buildingPrompt: "The MIAX Exchange Group office building in Princeton, NJ, a modern corporate facility."
  },
  "Toronto Stock Exchange (TMX)": {
    city: "Toronto",
    country: "Canada",
    lat: 43.648,
    lon: -79.381,
    indexSymbol: "^GSPTSE",
    indexName: "S&P/TSX Composite",
    buildingPrompt: "The Exchange Tower in downtown Toronto, a modern glass skyscraper in the financial district."
  },
  "Canadian Securities Exchange": {
    city: "Toronto",
    country: "Canada",
    lat: 43.655,
    lon: -79.385,
    indexSymbol: "^GSPTSE", // Proxy
    indexName: "S&P/TSX Composite",
    buildingPrompt: "A modern office building in Toronto's financial district representing the Canadian Securities Exchange."
  },
  "Bolsa Mexicana de Valores": {
    city: "Mexico City",
    country: "Mexico",
    lat: 19.432,
    lon: -99.133,
    indexSymbol: "^MXX",
    indexName: "IPC Mexico",
    buildingPrompt: "The distinctive Bolsa Mexicana de Valores building with its reflective glass geodesic dome structure."
  },
  "Bolsa Institucional de Valores (BIVA)": {
    city: "Mexico City",
    country: "Mexico",
    lat: 19.435,
    lon: -99.140,
    indexSymbol: "^MXX", // Proxy
    indexName: "IPC Mexico",
    buildingPrompt: "The modern BIVA exchange headquarters in Mexico City."
  },
  "Santiago Stock Exchange": {
    city: "Santiago",
    country: "Chile",
    lat: -33.448,
    lon: -70.669,
    indexSymbol: "^IPSA",
    indexName: "IPSA",
    buildingPrompt: "The historic Bolsa de Comercio de Santiago building, a French Renaissance style palace."
  },
  "Bolsa Electrónica de Chile": {
    city: "Santiago",
    country: "Chile",
    lat: -33.438,
    lon: -70.659,
    indexSymbol: "^IPSA", // Proxy
    indexName: "IPSA",
    buildingPrompt: "Modern financial offices in Santiago representing the electronic exchange."
  },
  "Bolsa de Valores de Colombia": {
    city: "Bogotá",
    country: "Colombia",
    lat: 4.711,
    lon: -74.072,
    indexSymbol: "ICAP.CO", // Approximate
    indexName: "COLCAP",
    buildingPrompt: "The Bolsa de Valores de Colombia building in Bogotá."
  },
  "Bolsa de Valores de Lima": {
    city: "Lima",
    country: "Peru",
    lat: -12.046,
    lon: -77.042,
    indexSymbol: "^SPBLPGPT",
    indexName: "S&P/BVL Peru General",
    buildingPrompt: "The traditional Bolsa de Valores de Lima building in the historic center."
  },
  "Latinex": {
    city: "Panama City",
    country: "Panama",
    lat: 8.982,
    lon: -79.519,
    indexSymbol: "^BVPS", // Approximate
    indexName: "BVPSI",
    buildingPrompt: "Modern skyscraper in Panama City's financial district."
  },
  "Bolsa Nacional de Valores": {
    city: "San José",
    country: "Costa Rica",
    lat: 9.928,
    lon: -84.090,
    indexSymbol: "^BNV",
    indexName: "BNV Index",
    buildingPrompt: "The Bolsa Nacional de Valores building in San José."
  },
  "Jamaica Stock Exchange": {
    city: "Kingston",
    country: "Jamaica",
    lat: 17.971,
    lon: -76.793,
    indexSymbol: "^JSE",
    indexName: "JSE Market Index",
    buildingPrompt: "The Jamaica Stock Exchange building in Kingston, a modest Caribbean structure."
  },
  "Bermuda Stock Exchange": {
    city: "Hamilton",
    country: "Bermuda",
    lat: 32.294,
    lon: -64.783,
    indexSymbol: "^BSX",
    indexName: "BSX Index",
    buildingPrompt: "The Bermuda Stock Exchange building in Hamilton with colonial architecture."
  },
  "Euronext Amsterdam": {
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.365,
    lon: 4.885,
    indexSymbol: "^AEX",
    indexName: "AEX",
    buildingPrompt: "The historic Beurs van Berlage in Amsterdam."
  },
  "Euronext Brussels": {
    city: "Brussels",
    country: "Belgium",
    lat: 50.850,
    lon: 4.351,
    indexSymbol: "^BFX",
    indexName: "BEL 20",
    buildingPrompt: "The Brussels Stock Exchange building with its grand neoclassical facade."
  },
  "Euronext Dublin": {
    city: "Dublin",
    country: "Ireland",
    lat: 53.349,
    lon: -6.260,
    indexSymbol: "^ISEQ",
    indexName: "ISEQ Overall",
    buildingPrompt: "The historic Irish Stock Exchange building in Dublin."
  },
  "Euronext Oslo": {
    city: "Oslo",
    country: "Norway",
    lat: 59.913,
    lon: 10.752,
    indexSymbol: "^OSEAX",
    indexName: "OBX",
    buildingPrompt: "The Oslo Stock Exchange building, a monumental structure in the city center."
  },
  "Euronext Paris": {
    city: "Paris",
    country: "France",
    lat: 48.856,
    lon: 2.352,
    indexSymbol: "^FCHI",
    indexName: "CAC 40",
    buildingPrompt: "The Palais Brongniart in Paris, the historic home of the bourse with corinthian columns."
  },
  "Deutsche Börse": {
    city: "Frankfurt",
    country: "Germany",
    lat: 50.115,
    lon: 8.678,
    indexSymbol: "^GDAXI",
    indexName: "DAX",
    buildingPrompt: "The Frankfurt Stock Exchange building with the Bull and Bear statues."
  },
  "Börse Stuttgart": {
    city: "Stuttgart",
    country: "Germany",
    lat: 48.775,
    lon: 9.182,
    indexSymbol: "^GDAXI", // Proxy
    indexName: "DAX",
    buildingPrompt: "The Börse Stuttgart building in Germany."
  },
  "BME Spanish Exchanges": {
    city: "Madrid",
    country: "Spain",
    lat: 40.416,
    lon: -3.703,
    indexSymbol: "^IBEX",
    indexName: "IBEX 35",
    buildingPrompt: "The Palacio de la Bolsa de Madrid, a neoclassical 19th-century building."
  },
  "Cboe Europe": {
    city: "London",
    country: "UK",
    lat: 51.513,
    lon: -0.088,
    indexSymbol: "^STOXX50E",
    indexName: "EURO STOXX 50",
    buildingPrompt: "Modern office building in the City of London."
  },
  "Nasdaq Nordic & Baltics": {
    city: "Stockholm",
    country: "Sweden",
    lat: 59.329,
    lon: 18.068,
    indexSymbol: "^OMXS30",
    indexName: "OMX Stockholm 30",
    buildingPrompt: "The Nasdaq Stockholm building in Frihamnen, a modern facility."
  },
  "Nasdaq Copenhagen": {
    city: "Copenhagen",
    country: "Denmark",
    lat: 55.676,
    lon: 12.568,
    indexSymbol: "^OMXC25",
    indexName: "OMX Copenhagen 25",
    buildingPrompt: "The historic exchange building in Copenhagen."
  },
  "Nasdaq Helsinki": {
    city: "Helsinki",
    country: "Finland",
    lat: 60.169,
    lon: 24.938,
    indexSymbol: "^OMXH25",
    indexName: "OMX Helsinki 25",
    buildingPrompt: "The Helsinki Stock Exchange building with its granite facade."
  },
  "Nasdaq Iceland": {
    city: "Reykjavik",
    country: "Iceland",
    lat: 64.146,
    lon: -21.942,
    indexSymbol: "^OMXI10",
    indexName: "OMX Iceland 10",
    buildingPrompt: "Modern office building in Reykjavik."
  },
  "Nasdaq Stockholm": {
    city: "Stockholm",
    country: "Sweden",
    lat: 59.332,
    lon: 18.064,
    indexSymbol: "^OMXS30",
    indexName: "OMX Stockholm 30",
    buildingPrompt: "The Nasdaq Stockholm building in Frihamnen."
  },
  "Vienna Stock Exchange": {
    city: "Vienna",
    country: "Austria",
    lat: 48.208,
    lon: 16.373,
    indexSymbol: "^ATX",
    indexName: "ATX",
    buildingPrompt: "The Palais Caprara-Geymüller in Vienna, home of the exchange."
  },
  "Prague Stock Exchange": {
    city: "Prague",
    country: "Czech Republic",
    lat: 50.075,
    lon: 14.437,
    indexSymbol: "^PX",
    indexName: "PX Index",
    buildingPrompt: "The modern Prague Stock Exchange building."
  },
  "Budapest Stock Exchange": {
    city: "Budapest",
    country: "Hungary",
    lat: 47.497,
    lon: 19.040,
    indexSymbol: "^BUX",
    indexName: "BUX",
    buildingPrompt: "The historic exchange palace in Budapest."
  },
  "Warsaw Stock Exchange": {
    city: "Warsaw",
    country: "Poland",
    lat: 52.229,
    lon: 21.012,
    indexSymbol: "^WIG20",
    indexName: "WIG20",
    buildingPrompt: "The former Polish Communist Party headquarters, now the Warsaw Stock Exchange."
  },
  "Bucharest Stock Exchange": {
    city: "Bucharest",
    country: "Romania",
    lat: 44.435,
    lon: 26.102,
    indexSymbol: "^BET",
    indexName: "BET Index",
    buildingPrompt: "Modern office building in Bucharest."
  },
  "Bulgarian Stock Exchange": {
    city: "Sofia",
    country: "Bulgaria",
    lat: 42.697,
    lon: 23.321,
    indexSymbol: "^SOFIX",
    indexName: "SOFIX",
    buildingPrompt: "Administrative building in Sofia."
  },
  "Zagreb Stock Exchange": {
    city: "Zagreb",
    country: "Croatia",
    lat: 45.815,
    lon: 15.981,
    indexSymbol: "^CROBEX",
    indexName: "CROBEX",
    buildingPrompt: "Modern office tower in Zagreb."
  },
  "Ljubljana Stock Exchange": {
    city: "Ljubljana",
    country: "Slovenia",
    lat: 46.056,
    lon: 14.505,
    indexSymbol: "^SBITOP",
    indexName: "SBITOP",
    buildingPrompt: "Office building in Ljubljana center."
  },
  "Athens Stock Exchange": {
    city: "Athens",
    country: "Greece",
    lat: 37.983,
    lon: 23.727,
    indexSymbol: "^ATG",
    indexName: "Athens General",
    buildingPrompt: "Modern building of the Athens Exchange Group."
  },
  "Cyprus Stock Exchange": {
    city: "Nicosia",
    country: "Cyprus",
    lat: 35.185,
    lon: 33.382,
    indexSymbol: "^CSE",
    indexName: "CSE General",
    buildingPrompt: "Modern office building in Nicosia."
  },
  "Malta Stock Exchange": {
    city: "Valletta",
    country: "Malta",
    lat: 35.899,
    lon: 14.514,
    indexSymbol: "^MSE",
    indexName: "MSE Share Index",
    buildingPrompt: "The Garrison Chapel in Valletta, a historic building housing the exchange."
  },
  "Luxembourg Stock Exchange": {
    city: "Luxembourg",
    country: "Luxembourg",
    lat: 49.611,
    lon: 6.131,
    indexSymbol: "LUXXX", // Placeholder
    indexName: "LuxX Index",
    buildingPrompt: "Modern building in Luxembourg City."
  },
  "Borsa Istanbul": {
    city: "Istanbul",
    country: "Turkey",
    lat: 41.008,
    lon: 28.978,
    indexSymbol: "^XU100",
    indexName: "BIST 100",
    buildingPrompt: "The modern Borsa Istanbul campus in Istinye."
  },
  "Tel Aviv Stock Exchange": {
    city: "Tel Aviv",
    country: "Israel",
    lat: 32.085,
    lon: 34.781,
    indexSymbol: "^TA35",
    indexName: "TA-35",
    buildingPrompt: "The modern TASE building in Tel Aviv."
  },
  "Palestine Exchange": {
    city: "Nablus",
    country: "Palestine",
    lat: 32.222,
    lon: 35.262,
    indexSymbol: "^ALQUDS",
    indexName: "Al-Quds Index",
    buildingPrompt: "Office building in Nablus."
  },
  "Amman Stock Exchange": {
    city: "Amman",
    country: "Jordan",
    lat: 31.945,
    lon: 35.928,
    indexSymbol: "^ASE",
    indexName: "ASE Index",
    buildingPrompt: "Modern building in Amman."
  },
  "Saudi Exchange (Tadawul)": {
    city: "Riyadh",
    country: "Saudi Arabia",
    lat: 24.713,
    lon: 46.675,
    indexSymbol: "^TASI",
    indexName: "TASI",
    buildingPrompt: "King Abdullah Financial District tower in Riyadh."
  },
  "Abu Dhabi Securities Exchange": {
    city: "Abu Dhabi",
    country: "UAE",
    lat: 24.453,
    lon: 54.377,
    indexSymbol: "^ADI",
    indexName: "FTSE ADX General",
    buildingPrompt: "Modern skyscraper in Abu Dhabi."
  },
  "Dubai Financial Market": {
    city: "Dubai",
    country: "UAE",
    lat: 25.204,
    lon: 55.270,
    indexSymbol: "^DFMGI",
    indexName: "DFM General",
    buildingPrompt: "The Dubai World Trade Centre building."
  },
  "Bahrain Bourse": {
    city: "Manama",
    country: "Bahrain",
    lat: 26.228,
    lon: 50.586,
    indexSymbol: "^BAX",
    indexName: "Bahrain All Share",
    buildingPrompt: "Bahrain Financial Harbour towers."
  },
  "Boursa Kuwait": {
    city: "Kuwait City",
    country: "Kuwait",
    lat: 29.375,
    lon: 47.977,
    indexSymbol: "^BKP",
    indexName: "Premier Market",
    buildingPrompt: "Modern exchange building in Kuwait City."
  },
  "Qatar Stock Exchange": {
    city: "Doha",
    country: "Qatar",
    lat: 25.285,
    lon: 51.531,
    indexSymbol: "^GNRI",
    indexName: "QE General",
    buildingPrompt: "Modern building with Islamic architectural elements in Doha."
  },
  "Muscat Stock Exchange": {
    city: "Muscat",
    country: "Oman",
    lat: 23.585,
    lon: 58.405,
    indexSymbol: "^MSX30",
    indexName: "MSX 30",
    buildingPrompt: "Office building in Muscat."
  },
  "Tehran Stock Exchange": {
    city: "Tehran",
    country: "Iran",
    lat: 35.689,
    lon: 51.389,
    indexSymbol: "^TEDPIX",
    indexName: "TEDPIX",
    buildingPrompt: "Tehran Stock Exchange building."
  },
  "Iran Fara Bourse": {
    city: "Tehran",
    country: "Iran",
    lat: 35.699,
    lon: 51.399,
    indexSymbol: "^IFX",
    indexName: "IFX",
    buildingPrompt: "Office building in Tehran."
  },
  "Namibian Stock Exchange": {
    city: "Windhoek",
    country: "Namibia",
    lat: -22.560,
    lon: 17.065,
    indexSymbol: "^NSX",
    indexName: "NSX Overall",
    buildingPrompt: "Building in Windhoek city center."
  },
  "Dar es Salaam Stock Exchange": {
    city: "Dar es Salaam",
    country: "Tanzania",
    lat: -6.792,
    lon: 39.208,
    indexSymbol: "^DSEI",
    indexName: "DSE All Share",
    buildingPrompt: "Office building in Dar es Salaam."
  },
  "Bourse Régionale des Valeurs Mobilières": {
    city: "Abidjan",
    country: "West Africa",
    lat: 5.360,
    lon: -4.008,
    indexSymbol: "^BRVM10",
    indexName: "BRVM 10",
    buildingPrompt: "Modern building in Abidjan."
  },
  "Nigerian Exchange": {
    city: "Lagos",
    country: "Nigeria",
    lat: 6.524,
    lon: 3.379,
    indexSymbol: "^NGSE30",
    indexName: "NSE 30",
    buildingPrompt: "The Nigerian Stock Exchange building in Lagos."
  },
  "Ghana Stock Exchange": {
    city: "Accra",
    country: "Ghana",
    lat: 5.603,
    lon: -0.187,
    indexSymbol: "^GSECI",
    indexName: "GSE Composite",
    buildingPrompt: "Building in Accra."
  },
  "Nairobi Securities Exchange": {
    city: "Nairobi",
    country: "Kenya",
    lat: -1.292,
    lon: 36.821,
    indexSymbol: "^NASI",
    indexName: "NSE All Share",
    buildingPrompt: "The Exchange building in Nairobi."
  },
  "Rwanda Stock Exchange": {
    city: "Kigali",
    country: "Rwanda",
    lat: -1.944,
    lon: 30.061,
    indexSymbol: "^RSEASI",
    indexName: "RSE All Share",
    buildingPrompt: "Modern office in Kigali."
  },
  "Lusaka Securities Exchange": {
    city: "Lusaka",
    country: "Zambia",
    lat: -15.387,
    lon: 28.322,
    indexSymbol: "^LASI",
    indexName: "LuSE All Share",
    buildingPrompt: "Office building in Lusaka."
  },
  "Stock Exchange of Mauritius": {
    city: "Port Louis",
    country: "Mauritius",
    lat: -20.162,
    lon: 57.499,
    indexSymbol: "^SEMDEX",
    indexName: "SEMDEX",
    buildingPrompt: "Modern building in Port Louis."
  },
  "Casablanca Stock Exchange": {
    city: "Casablanca",
    country: "Morocco",
    lat: 33.573,
    lon: -7.589,
    indexSymbol: "^MASI",
    indexName: "MASI",
    buildingPrompt: "Modern architecture building in Casablanca."
  },
  "Tunis Stock Exchange": {
    city: "Tunis",
    country: "Tunisia",
    lat: 36.806,
    lon: 10.181,
    indexSymbol: "^TUNINDEX",
    indexName: "Tunindex",
    buildingPrompt: "Office building in Tunis."
  },
  "The Egyptian Exchange": {
    city: "Cairo",
    country: "Egypt",
    lat: 30.044,
    lon: 31.235,
    indexSymbol: "^EGX30",
    indexName: "EGX 30",
    buildingPrompt: "Historic building in downtown Cairo."
  },
  "Baku Stock Exchange": {
    city: "Baku",
    country: "Azerbaijan",
    lat: 40.409,
    lon: 49.867,
    indexSymbol: "^BSE", // Placeholder
    indexName: "Baku Stock Exchange",
    buildingPrompt: "Modern business center in Baku."
  },
  "Armenia Securities Exchange": {
    city: "Yerevan",
    country: "Armenia",
    lat: 40.187,
    lon: 44.515,
    indexSymbol: "^AMX", // Placeholder
    indexName: "AMX Index",
    buildingPrompt: "Office building in Yerevan."
  },
  "Kazakhstan Stock Exchange": {
    city: "Almaty",
    country: "Kazakhstan",
    lat: 43.222,
    lon: 76.851,
    indexSymbol: "^KASE",
    indexName: "KASE Index",
    buildingPrompt: "Office building in Almaty."
  },
  "AIX": {
    city: "Astana",
    country: "Kazakhstan",
    lat: 51.160,
    lon: 71.470,
    indexSymbol: "^AIX", // Placeholder
    indexName: "AIX All Share",
    buildingPrompt: "Modern building in Astana International Financial Centre."
  },
  "Tashkent Stock Exchange": {
    city: "Tashkent",
    country: "Uzbekistan",
    lat: 41.299,
    lon: 69.240,
    indexSymbol: "^TASIX",
    indexName: "TASIX",
    buildingPrompt: "Historic building in Tashkent."
  },
  "BCSE": {
    city: "Minsk",
    country: "Belarus",
    lat: 53.904,
    lon: 27.561,
    indexSymbol: "^BCSE", // Placeholder
    indexName: "BCSE",
    buildingPrompt: "Office building in Minsk."
  },
  "MERJ Exchange": {
    city: "Victoria",
    country: "Seychelles",
    lat: -4.619,
    lon: 55.451,
    indexSymbol: "^MERJ", // Placeholder
    indexName: "MERJ",
    buildingPrompt: "Office building in Victoria, Seychelles."
  },
  "New Zealand Exchange": {
    city: "Wellington",
    country: "New Zealand",
    lat: -41.286,
    lon: 174.776,
    indexSymbol: "^NZ50",
    indexName: "NZX 50",
    buildingPrompt: "The NZX Centre in Wellington."
  },
  // --- Missing Aliases from constants.ts ---
  "Tokyo Stock Exchange (JPX)": {
    city: "Tokyo",
    country: "Japan",
    lat: 35.683,
    lon: 139.775,
    indexSymbol: "^N225",
    indexName: "Nikkei 225",
    buildingPrompt: "The Tokyo Stock Exchange building (Kabutocho) with its distinct curved glass entrance."
  },
  "NEEQ (Beijing)": {
    city: "Beijing",
    country: "China",
    lat: 39.904,
    lon: 116.407,
    indexSymbol: "000001.SS", // Proxy using SSE as NEEQ data is hard to get free
    indexName: "China Market (Proxy)",
    buildingPrompt: "Modern financial district in Beijing near Financial Street."
  },
  "Taipei Exchange (TPEx)": {
    city: "Taipei",
    country: "Taiwan",
    lat: 25.023,
    lon: 121.555,
    indexSymbol: "^TWII", // Proxy using TAIEX
    indexName: "TAIEX (Proxy)",
    buildingPrompt: "Modern office building in Taipei."
  },
  "National Stock Exchange": {
    city: "Mumbai",
    country: "India",
    lat: 19.065,
    lon: 72.869,
    indexSymbol: "^NSEI",
    indexName: "NIFTY 50",
    buildingPrompt: "The modern glass National Stock Exchange building in Mumbai's Bandra Kurla Complex."
  },
  "Indonesia Stock Exchange": {
    city: "Jakarta",
    country: "Indonesia",
    lat: -6.208,
    lon: 106.845,
    indexSymbol: "^JKSE",
    indexName: "IDX Composite",
    buildingPrompt: "The Indonesia Stock Exchange building towers in Jakarta SCBD."
  },
  "Stock Exchange of Thailand": {
    city: "Bangkok",
    country: "Thailand",
    lat: 13.756,
    lon: 100.501,
    indexSymbol: "^SET.BK",
    indexName: "SET Index",
    buildingPrompt: "The Stock Exchange of Thailand building in Bangkok with its golden spire."
  },
  "Bursa Malaysia": {
    city: "Kuala Lumpur",
    country: "Malaysia",
    lat: 3.139,
    lon: 101.686,
    indexSymbol: "^KLSE",
    indexName: "FTSE Bursa Malaysia KLCI",
    buildingPrompt: "The Bursa Malaysia building in Kuala Lumpur."
  },
  "Ho Chi Minh Stock Exchange": {
    city: "Ho Chi Minh City",
    country: "Vietnam",
    lat: 10.823,
    lon: 106.629,
    indexSymbol: "^VNINDEX", // FMP or Gemini search
    indexName: "VN-Index",
    buildingPrompt: "The historic Ho Chi Minh City Stock Exchange building."
  },
  "Philippine Stock Exchange": {
    city: "Manila",
    country: "Philippines",
    lat: 14.599,
    lon: 120.984,
    indexSymbol: "PSEI.PS",
    indexName: "PSEi",
    buildingPrompt: "The Philippine Stock Exchange Tower in Bonifacio Global City."
  },
  "Dhaka Stock Exchange": {
    city: "Dhaka",
    country: "Bangladesh",
    lat: 23.810,
    lon: 90.412,
    indexSymbol: "DSEX", // Gemini search will handle
    indexName: "DSE Broad",
    buildingPrompt: "The Dhaka Stock Exchange building in Nikunja."
  },
  "Colombo Stock Exchange": {
    city: "Colombo",
    country: "Sri Lanka",
    lat: 6.927,
    lon: 79.861,
    indexSymbol: "^CSE",
    indexName: "ASPI",
    buildingPrompt: "The World Trade Center Colombo housing the exchange."
  },
  "Pakistan Stock Exchange": {
    city: "Karachi",
    country: "Pakistan",
    lat: 24.860,
    lon: 67.001,
    indexSymbol: "^KSE",
    indexName: "KSE 100",
    buildingPrompt: "The Pakistan Stock Exchange building in Karachi."
  },
  "ASX": {
    city: "Sydney",
    country: "Australia",
    lat: -33.864,
    lon: 151.206,
    indexSymbol: "^AXJO",
    indexName: "S&P/ASX 200",
    buildingPrompt: "The Exchange Centre in Sydney near Bridge Street."
  }
};

// Fallback for unknown exchanges
export const DEFAULT_MAPPING: ExchangeMapping = {
  city: "New York",
  country: "USA",
  lat: 40.712,
  lon: -74.006,
  indexSymbol: "^DJI",
  indexName: "Market Index",
  buildingPrompt: "A generic modern stock exchange building in a financial district."
};
