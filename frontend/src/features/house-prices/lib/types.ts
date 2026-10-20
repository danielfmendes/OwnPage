export interface HabitacaoRecord {
  mes_ano: string;
  tipo_venda: 'compra' | 'arrendamento';
  tipo_habitacao: string;
  quartos: string;
  distrito: string;
  municipio: string;
  freguesia: string;
  total_rows: number;
  avg_area: number;
  avg_preco: number;
  avg_m2: number;
}

export type Page =
  | 'market-overview'
  | 'ai-predictions'
  | 'signals'
  | 'compare'
  | 'rooms'
  | 'affordability'
  | 'time-machine';

// Served under /lisbon-house-prices in the monorepo, so every route carries that prefix
export const BASE = '/lisbon-house-prices';

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

// URL slug ↔ page ID. Kept here so routing lives alongside the page type.
export const PAGE_PATHS: Record<Page, string> = {
  'market-overview': BASE + '/',
  'ai-predictions':  BASE + '/forecast',
  'signals':         BASE + '/signals',
  'compare':         BASE + '/compare',
  'rooms':           BASE + '/rooms',
  'affordability':   BASE + '/affordability',
  'time-machine':    BASE + '/time-machine',
};

export function pathToPage(path: string): Page {
  const relative = normalize(path === BASE || path.startsWith(BASE + '/') ? path.slice(BASE.length) : path);
  const entry = (Object.entries(PAGE_PATHS) as Array<[Page, string]>)
    .find(([, p]) => normalize(p.slice(BASE.length)) === relative);
  return entry?.[0] ?? 'market-overview';
}

export interface DrilldownState {
  municipio: string | null;
  freguesia: string | null;
}

export type ChartMetric = 'avg_m2' | 'avg_preco';

export interface ChartPoint {
  mes_ano: string;
  value: number;
  forecast?: boolean;
  lower?: number;
  upper?: number;
}

export interface MunicipioStat {
  name: string;
  avg_m2: number;
  avg_preco: number;
  avg_area: number;
  total_rows: number;
  yoy_change: number;
  rental_yield: number;
}
