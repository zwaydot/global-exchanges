import * as cheerio from 'cheerio';

const ISSUE_BASE_URL = 'https://focus.world-exchanges.org';
const DEFAULT_SLUG = 'november-2025';
const EXCHANGE_STATS_KV_KEY = 'exchange-stats:v1';
const MILLION = 1_000_000;

const MARKET_CAP_HEADING = 'Equity - Domestic market capitalisation';
const TRADING_VALUE_HEADING = 'Equity - Value of share trading';
const LISTED_COMPANIES_HEADING = 'Equity - Number of listed companies';

export interface ListedCompaniesStats {
  domestic?: number | null;
  foreign?: number | null;
  total?: number | null;
}

export interface ExchangeStatEntry {
  marketCapUSD?: number | null;
  marketCapChangeMoM?: number | null;
  marketCapChangeYoY?: number | null;
  monthlyTradingValueUSD?: number | null;
  tradingValueChangeMoM?: number | null;
  tradingValueChangeYoY?: number | null;
  listedCompanies?: ListedCompaniesStats | null;
}

export interface StoredExchangeStats {
  version: number;
  issueSlug: string;
  issueTitle: string;
  periodLabel: string;
  extractedAt: number;
  data: Record<string, ExchangeStatEntry>;
}

type TableRow = {
  latestLabel: string;
  map: Map<string, RowMetrics>;
};

type RowMetrics = {
  latest?: number | null;
  previous?: number | null;
  mom?: number | null;
  yoy?: number | null;
};

type CompaniesTable = {
  map: Map<string, ListedCompaniesStats>;
};

export async function getStoredExchangeStats(kv?: KVNamespace): Promise<StoredExchangeStats | null> {
  if (!kv) return null;
  try {
    const cached = (await kv.get(EXCHANGE_STATS_KV_KEY, 'json')) as StoredExchangeStats | null;
    return cached ?? null;
  } catch (error) {
    console.error('[ExchangeStats] Failed to read KV', error);
    return null;
  }
}

export async function refreshExchangeStats(kv?: KVNamespace): Promise<StoredExchangeStats> {
  const html = await fetchLatestIssueHtml();
  const parseResult = await parseIssueHtml(html);
  const payload: StoredExchangeStats = {
    version: 1,
    issueSlug: parseResult.slug,
    issueTitle: parseResult.issueTitle,
    periodLabel: parseResult.periodLabel,
    extractedAt: Date.now(),
    data: parseResult.data,
  };

  if (kv) {
    try {
      await kv.put(EXCHANGE_STATS_KV_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error('[ExchangeStats] Failed to write KV', error);
    }
  }

  return payload;
}

async function fetchLatestIssueHtml(): Promise<string> {
  // Fetch fallback slug first to discover the newest issue, then fetch the latest page.
  const initialHtml = await fetchIssueHtml(DEFAULT_SLUG);
  const $ = cheerio.load(initialHtml);
  const latestSlug = extractLatestSlug($) ?? DEFAULT_SLUG;

  if (latestSlug === DEFAULT_SLUG) {
    return initialHtml;
  }

  return fetchIssueHtml(latestSlug);
}

async function fetchIssueHtml(slug: string): Promise<string> {
  const url = `${ISSUE_BASE_URL}/issue/${slug}/market-statistics`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'global-exchanges-bot/1.0 (contact@driven.ai)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch issue page (${response.status})`);
  }

  return response.text();
}

function extractLatestSlug($: cheerio.CheerioAPI): string | null {
  const firstLink = $('#marketstats-list a').first();
  if (!firstLink.length) return null;
  const href = firstLink.attr('href');
  if (!href) return null;
  const parts = href.split('/').filter(Boolean);
  const issueIndex = parts.indexOf('issue');
  if (issueIndex >= 0 && issueIndex + 1 < parts.length) {
    return parts[issueIndex + 1];
  }
  return null;
}

async function parseIssueHtml(html: string) {
  const $ = cheerio.load(html);
  const issueTitle = $('h1').first().text().trim() || 'Market Statistics';
  const slugMatch = issueTitle.match(/Market Statistics\s*-\s*(.+)$/i);
  const periodLabel = slugMatch ? slugMatch[1] : issueTitle.replace('Market Statistics -', '').trim();
  const slugAttr = extractLatestSlug($) ?? DEFAULT_SLUG;

  const marketCapTable = parseMetricTable($, MARKET_CAP_HEADING);
  const tradingValueTable = parseMetricTable($, TRADING_VALUE_HEADING);
  const listedCompaniesTable = parseCompaniesTable($);

  console.log(`[ExchangeStats] Found ${marketCapTable.map.size} exchanges in market cap table, ${tradingValueTable.map.size} in trading value table, ${listedCompaniesTable.map.size} in listed companies table`);

  const data: Record<string, ExchangeStatEntry> = {};

  // 收集所有出现的 key (normalizeKey 后的名字)
  const allKeys = new Set<string>([
    ...marketCapTable.map.keys(),
    ...tradingValueTable.map.keys(),
    ...listedCompaniesTable.map.keys()
  ]);

  for (const key of allKeys) {
    const marketCapRow = marketCapTable.map.get(key);
    const tradingRow = tradingValueTable.map.get(key);
    const companiesRow = listedCompaniesTable.map.get(key);

    const entry: ExchangeStatEntry = {};

    if (marketCapRow?.latest != null) {
      entry.marketCapUSD = marketCapRow.latest * MILLION;
    }
    if (marketCapRow?.mom != null) entry.marketCapChangeMoM = marketCapRow.mom;
    if (marketCapRow?.yoy != null) entry.marketCapChangeYoY = marketCapRow.yoy;

    if (tradingRow?.latest != null) {
      entry.monthlyTradingValueUSD = tradingRow.latest * MILLION;
    }
    if (tradingRow?.mom != null) entry.tradingValueChangeMoM = tradingRow.mom;
    if (tradingRow?.yoy != null) entry.tradingValueChangeYoY = tradingRow.yoy;

    if (companiesRow) {
      entry.listedCompanies = companiesRow;
    }

    // 保存所有出现在表格中的交易所，即使部分数据为空
    // 这样能确保获取 WFE 上所有真实的交易所数据
    data[key] = entry;
  }

  console.log(`[ExchangeStats] Parsed ${allKeys.size} unique exchanges, saved ${Object.keys(data).length} total exchanges`);

  return {
    slug: slugAttr,
    issueTitle,
    periodLabel: normalizePeriodLabel(marketCapTable.latestLabel || periodLabel),
    data,
  };
}

function parseMetricTable($: cheerio.CheerioAPI, heading: string): TableRow {
  const table = findTable($, heading);
  if (!table) {
    return { latestLabel: '', map: new Map() };
  }

  const headerCells = table.find('thead tr').first().find('th');
  const dataColumnIndexes: number[] = [];
  const percentIndexes: number[] = [];

  headerCells.each((index, cell) => {
    const label = $(cell).text().trim().toLowerCase();
    if (index === 0) return; // exchange name column
    if (label.includes('%change')) {
      percentIndexes.push(index);
    } else {
      dataColumnIndexes.push(index);
    }
  });

  const latestDataIndex = dataColumnIndexes[dataColumnIndexes.length - 1];
  const previousDataIndex = dataColumnIndexes.length > 1 ? dataColumnIndexes[dataColumnIndexes.length - 2] : latestDataIndex;
  const latestLabel = headerCells.eq(latestDataIndex).text().trim();

  const momIndex = percentIndexes[0];
  const yoyIndex = percentIndexes[1];

  const rows = new Map<string, RowMetrics>();

  table.find('tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length === 0) return;

    const name = cleanName(cells.eq(0).text());
    if (!name || shouldSkipRow(name)) return;

    const latestValue = parseNumeric(cells.eq(latestDataIndex).text());
    const previousValue = parseNumeric(cells.eq(previousDataIndex).text());
    const mom = momIndex != null ? parsePercent(cells.eq(momIndex).text()) : null;
    const yoy = yoyIndex != null ? parsePercent(cells.eq(yoyIndex).text()) : null;

    rows.set(normalizeKey(name), {
      latest: latestValue,
      previous: previousValue,
      mom,
      yoy,
    });
  });

  return { latestLabel, map: rows };
}

function parseCompaniesTable($: cheerio.CheerioAPI): CompaniesTable {
  const table = findTable($, LISTED_COMPANIES_HEADING);
  if (!table) return { map: new Map<string, ListedCompaniesStats>() };

  const rows = new Map<string, ListedCompaniesStats>();

  table.find('tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 3) return;

    const name = cleanName(cells.eq(0).text());
    if (!name || shouldSkipRow(name)) return;

    const domestic = parseNumeric(cells.eq(1).text());
    const foreign = parseNumeric(cells.eq(2).text());
    const total = parseNumeric(cells.eq(3).text());

    rows.set(normalizeKey(name), {
      domestic: domestic ?? null,
      foreign: foreign ?? null,
      total: total ?? null,
    });
  });

  return { map: rows };
}

function findTable($: cheerio.CheerioAPI, heading: string) {
  const headingEl = $('h3')
    .filter((_, el) => $(el).text().trim().toLowerCase().startsWith(heading.toLowerCase()))
    .first();

  if (!headingEl.length) {
    console.warn(`[ExchangeStats] Heading not found: ${heading}`);
    return null;
  }

  const overflowContainer = headingEl.nextAll('div.uk-overflow-auto').first();
  if (!overflowContainer.length) {
    console.warn(`[ExchangeStats] Table container missing for heading: ${heading}`);
    return null;
  }

  const table = overflowContainer.find('table').first();
  if (!table.length) {
    console.warn(`[ExchangeStats] Table missing for heading: ${heading}`);
    return null;
  }

  return table;
}

function parseNumeric(value: string): number | null {
  const normalized = value.replace(/[^0-9.\-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePercent(value: string): number | null {
  const normalized = value.replace(/[^0-9.\-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanName(value: string): string {
  // 移除可能的脚注引用，如 "Exchange Name 1.2" -> "Exchange Name"
  // 简单规则：如果末尾有数字，且前面的字符是字母，可能是脚注，但也可能是名称一部分（如 B3）。
  // WFE 表格里的 footnote 通常是上标，text() 会直接连在一起。
  // 这里的处理比较保守：只 trim 多余空格。normalizeKey 会去掉非字母数字。
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeKey(value: string): string {
  // 统一转小写，移除所有非字母数字字符
  // e.g. "Nasdaq - US" -> "nasdaqus"
  // "B3 - Brasil Bolsa Balcão" -> "b3brasilbolsabalco"
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function shouldSkipRow(name: string): boolean {
  const lower = name.toLowerCase();
  if (!name) return true;
  // 跳过区域汇总行和注脚
  if (['americas', 'apac', 'emea'].includes(lower)) return true;
  if (lower.startsWith('total for')) return true;
  if (lower.startsWith('note:')) return true;
  if (lower === 'note') return true;
  return false;
}

function normalizePeriodLabel(label: string): string {
  if (!label) return '';
  return label.replace("'", ' ').replace(/\s+/g, ' ').trim();
}
