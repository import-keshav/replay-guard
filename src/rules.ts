/** FanCode F1 pages: /formula1/…, /formula-1/… (highlights) and /tour-listing/formula1. */
export const isF1Page = (href: string): boolean => {
  try {
    const u = new URL(href);
    return /^(?:www\.)?fancode\.com$/.test(u.hostname) && /^\/(?:tour-listing\/)?formula-?1(?:\/|$)/.test(u.pathname);
  } catch {
    return false;
  }
};

// ponytail: keyword heuristic. It misses spoilers phrased without these words; the upgrade path
// is an allowlist of known-safe catalogue titles.

/** 2026 grid, used until (and whenever) the live driver list from the API is unavailable. */
const SEED_DRIVERS = [
  'Max Verstappen', 'Isack Hadjar', 'Liam Lawson', 'Arvid Lindblad', 'Charles Leclerc',
  'Lewis Hamilton', 'George Russell', 'Andrea Kimi Antonelli', 'Lando Norris', 'Oscar Piastri',
  'Fernando Alonso', 'Lance Stroll', 'Pierre Gasly', 'Franco Colapinto', 'Jack Doohan',
  'Esteban Ocon', 'Oliver Bearman', 'Alexander Albon', 'Carlos Sainz', 'Nico Hülkenberg',
  'Gabriel Bortoleto', 'Sergio Pérez', 'Valtteri Bottas', 'Yuki Tsunoda',
];
/** Short forms titles use instead of the given name the API returns. */
const NICKNAMES = ['alex', 'ollie', 'checo', 'nico', 'kimi', 'yuki'];
const TEAMS = [
  'red bull', 'racing bulls', 'ferrari', 'mercedes', 'mclaren', 'aston martin', 'alpine',
  'haas', 'williams', 'audi', 'sauber', 'cadillac',
];
const RESULTS = [
  'wins?', 'won', 'winners?', 'winning', 'victor(?:y|ies|ious)', 'podiums?', 'pole', 'p\\d{1,2}',
  'beats?', 'beaten', 'crash\\w*', 'retire[sd]?', 'retirement', 'dnf', 'penalt(?:y|ies)',
  'champion\\w*', 'dominan\\w*', 'dominat\\w*', 'leads?', 'leader', 'fastest lap', 'overtak\\w*',
  'pass(?:es|ed)', 'sweeps?', 'heartbreak\\w*', 'disaster\\w*', 'stunning', 'drama\\w*',
  'results?', 'standings', 'classification', 'post-race', 'press conference', 'react(?:s|ion)?',
  'celebrat\\w*', 'one-two', '1-2', 'hails?', 'admits?', 'urges?', 'slipped', 'turnaround',
  'secured?',
];
/** Lowercase and strip accents, so "Hulkenberg" matches "Hülkenberg". */
const fold = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let spoiler: RegExp;

/** Every first name and surname of these drivers (plus the seed grid) counts as a spoiler. */
export function setDrivers(fullNames: string[]): void {
  const words = new Set(NICKNAMES);
  for (const name of [...SEED_DRIVERS, ...fullNames]) {
    for (const w of fold(name).split(/\s+/)) if (w.length >= 3) words.add(escape(w));
  }
  spoiler = new RegExp(`(?<![\\w-])(?:${[...words, ...TEAMS, ...RESULTS].join('|')})(?![\\w-])`);
}
setDrivers([]);

export const isSpoiler = (text: string): boolean => spoiler.test(fold(text));

export const DRIVERS_URL = 'https://api.jolpi.ca/ergast/f1/current/drivers.json?limit=100';

/** Full names from a Jolpica (Ergast) driver response; anything malformed is dropped. */
export function parseDrivers(json: unknown): string[] {
  const list = (json as { MRData?: { DriverTable?: { Drivers?: unknown } } })?.MRData?.DriverTable?.Drivers;
  if (!Array.isArray(list)) return [];
  const ok = (s: unknown): s is string => typeof s === 'string' && s.length <= 40 && /^[\p{L}' .-]+$/u.test(s);
  return list.slice(0, 100).flatMap(d => (ok(d?.givenName) && ok(d?.familyName) ? [`${d.givenName} ${d.familyName}`] : []));
}

/** A live stream needs at least this much DVR window before rewinding is worth it. */
const LIVE_MIN_WINDOW_SEC = 30;
/** Stay a little inside a live DVR window: its oldest segment may already be evicted. */
const LIVE_START_MARGIN_SEC = 2;

export interface VideoSample { duration: number; currentTime: number; seekable: [number, number][] }

/** Where a video should jump to so it plays from the start, or null to leave it alone. */
export function startTarget(v: VideoSample): number | null {
  const first = v.seekable[0];
  let target: number;
  if (Number.isFinite(v.duration)) {
    target = first?.[0] ?? 0;
  } else {
    if (!first || first[1] - first[0] < LIVE_MIN_WINDOW_SEC) return null; // live without DVR: no start to go to
    target = first[0] + LIVE_START_MARGIN_SEC;
  }
  return v.currentTime - target > 1 ? target : null;
}
