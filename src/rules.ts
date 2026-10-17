/** FanCode F1 pages: /formula1/…, /formula-1/… (highlights) and /tour-listing/formula1. */
export const isF1Page = (href: string): boolean => {
  try {
    const u = new URL(href);
    return /^(?:www\.)?fancode\.com$/.test(u.hostname) && /^\/(?:tour-listing\/)?formula-?1(?:\/|$)/.test(u.pathname);
  } catch {
    return false;
  }
};

// ponytail: keyword heuristic. It misses spoilers phrased without these words and the driver
// list must follow the grid; the upgrade path is an allowlist of known-safe catalogue titles.
const DRIVERS = [
  'verstappen', 'hadjar', 'leclerc', 'hamilton', 'russell', 'antonelli', 'norris', 'piastri',
  'alonso', 'stroll', 'gasly', 'colapinto', 'doohan', 'ocon', 'bearman', 'albon', 'sainz',
  'h[uü]lkenberg', 'bortoleto', 'lawson', 'lindblad', 'tsunoda', 'p[eé]rez', 'bottas',
  'max', 'lewis', 'charles', 'lando', 'oscar', 'kimi', 'fernando', 'carlos', 'isack', 'yuki',
  'valtteri', 'sergio', 'esteban', 'pierre', 'franco', 'arvid', 'liam',
];
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
const SPOILER = new RegExp(`(?<![\\w-])(?:${[...DRIVERS, ...TEAMS, ...RESULTS].join('|')})(?![\\w-])`, 'i');

export const isSpoiler = (text: string): boolean => SPOILER.test(text);

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
