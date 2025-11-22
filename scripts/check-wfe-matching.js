// Script to check WFE name matching between constants.ts and KV data
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Normalize function (same as in lib/exchangeStats.ts)
function normalizeKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Read constants.ts and extract wfeName
const constantsPath = path.join(__dirname, '../constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf-8');

// Extract all wfeName values
const wfeNameRegex = /wfeName:\s*['"]([^'"]+)['"]/g;
const wfeNames = [];
let match;
while ((match = wfeNameRegex.exec(constantsContent)) !== null) {
  wfeNames.push(match[1]);
}

console.log(`Found ${wfeNames.length} exchanges in constants.ts\n`);

// Normalize all wfeNames
const normalizedWfeNames = new Map();
wfeNames.forEach(name => {
  const normalized = normalizeKey(name);
  normalizedWfeNames.set(normalized, name);
});

// Sample KV keys from user's data (you can replace this with actual KV data)
const kvKeys = [
  'b3brasilbolsabalco',
  'bermudastockexchange',
  'bolsadecomerciodesantiago',
  'bolsadevaloresdecolombia',
  'bolsadevaloresdelima',
  'bolsaelectronicadechile',
  'bolsalatinoamericanadevaloreslatinex',
  'bolsamexicanadevalores',
  'bolsanacionaldevaloresdecostarica',
  'canadiansecuritiesexchange',
  'jamaicastockexchange',
  'nasdaqus',
  'nyse',
  'tmxgroup',
  'armeniasecuritiesexchange',
  'astanainternationalexchange',
  'asxaustraliansecuritiesexchange',
  'bakustockexchange',
  'bseindialimited',
  'bursamalaysia',
  'colombostockexchange',
  'dhakastockexchange',
  'hochiminhstockexchange',
  'hongkongexchangesandclearing',
  'indonesiastockexchange',
  'japanexchangegroup',
  'kazakhstanstockexchange',
  'koreaexchange',
  'nationalequitiesexchangeandquotations',
  'nationalstockexchangeofindia',
  'nzxlimited',
  'pakistanstockexchange',
  'philippinestockexchange',
  'shanghaistockexchange',
  'shenzhenstockexchange',
  'singaporeexchange',
  'taipeiexchange',
  'taiwanstockexchange',
  'tashkentstockexchange',
  'thestockexchangeofthailand',
  'abudhabisecuritiesexchange',
  'ammanstockexchange',
  'athensstockexchange',
  'bahrainbourse',
  'belarusiancurrencyandstockexchange',
  'bmespanishexchanges',
  'borsaistanbul',
  'boursakuwait',
  'boursedecasablanca',
  'brvm',
  'buchareststockexchange',
  'budapeststockexchange',
  'bulgarianstockexchange',
  'cyprusstockexchange',
  'daressalaamstockexchange',
  'deutscheboerseag',
  'dubaifinancialmarket',
  'euronext',
  'ghanastockexchange',
  'iranfaraboursesecuritiesexchange',
  'johannesburgstockexchange',
  'ljubljanastockexchange',
  'lusakasecuritiesexchange',
  'luxembourgstockexchange',
  'maltastockexchange',
  'merjexchangelimited',
  'muscatstockexchange',
  'nairobisecuritiesexchange',
  'namibianstockexchange',
  'nasdaqnordicandbaltics',
  'nigerianexchange',
  'palestineexchange',
  'praguestockexchange',
  'qatarstockexchange',
  'rwandastockexchange',
  'saudiexchangetadawul',
  'sixswissexchange',
  'stockexchangeofmauritius',
  'tehranstockexchange',
  'telavivstockexchange',
  'theegyptianexchange',
  'tunisstockexchange',
  'viennastockexchange',
  'warsawstockexchange',
  'zagrebstockexchange',
  'bolsainstitucionaldevaloresdemexico',
  'cboeglobalmarkets',
  'miaxexchangegroup',
  'boersestuttgart',
  'cboeeurope'
];

console.log(`Found ${kvKeys.length} exchanges in KV data\n`);

// Check matches
const matched = new Set();
const unmatched = [];

kvKeys.forEach(kvKey => {
  if (normalizedWfeNames.has(kvKey)) {
    matched.add(kvKey);
  } else {
    unmatched.push(kvKey);
  }
});

console.log(`✅ Matched: ${matched.size} exchanges`);
console.log(`❌ Unmatched: ${unmatched.length} exchanges\n`);

if (unmatched.length > 0) {
  console.log('Unmatched KV keys (need to update wfeName in constants.ts):');
  unmatched.forEach(key => {
    console.log(`  - ${key}`);
  });
}

// Check which constants.ts exchanges don't have KV data
const constantsNormalized = Array.from(normalizedWfeNames.keys());
const missingInKV = constantsNormalized.filter(key => !kvKeys.includes(key));

if (missingInKV.length > 0) {
  console.log(`\n⚠️  Exchanges in constants.ts but not in KV (${missingInKV.length}):`);
  missingInKV.forEach(key => {
    const originalName = normalizedWfeNames.get(key);
    console.log(`  - ${originalName} (normalized: ${key})`);
  });
}

