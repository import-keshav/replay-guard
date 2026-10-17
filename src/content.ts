import { DRIVERS_URL, isF1Page, isSpoiler, parseDrivers, setDrivers, startTarget } from './rules.ts';

const ATTR = 'data-rg-f1';
const MARK = 'data-rg-spoiler';
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
let on = false;

function check(text: Node): void {
  const el = text.parentElement;
  if (el && !SKIP.has(el.tagName) && !el.hasAttribute(MARK) && isSpoiler(text.nodeValue ?? '')) el.setAttribute(MARK, '');
}

function scan(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) { check(root); return; }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) check(n);
}

const DAY_MS = 86_400_000;
let driversRequested = false;

function applyDrivers(names: string[]): void {
  setDrivers(names);
  if (on) scan(document);
  sync();
}

/** This season's drivers (incl. replacements and FP1 rookies), cached for a day. */
async function loadDrivers(): Promise<void> {
  const { drivers } = (await chrome.storage.local.get('drivers')) as { drivers?: { names: string[]; at: number } };
  if (drivers?.names.length) applyDrivers(drivers.names);
  if (drivers && Date.now() - drivers.at < DAY_MS) return;
  // no-referrer: otherwise FanCode's referrer policy decides whether the page URL reaches the API.
  const res = await fetch(DRIVERS_URL, { referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(60_000) });
  const names = parseDrivers(await res.json());
  if (!names.length) return;
  await chrome.storage.local.set({ drivers: { names, at: Date.now() } });
  applyDrivers(names);
}

function sync(): void {
  const next = isF1Page(location.href);
  if (next !== on) {
    on = next;
    document.documentElement.toggleAttribute(ATTR, on);
    if (on && !driversRequested) { driversRequested = true; void loadDrivers().catch(() => {}); } // offline: seed grid applies
    if (on) scan(document);
    else for (const el of document.querySelectorAll(`[${MARK}]`)) el.removeAttribute(MARK);
  }
  if (on && isSpoiler(document.title)) document.title = 'FanCode';
}

// ponytail: only the first `playing` per source is rewound, so later user seeks are respected.
// A player that restores its saved position after that first frame would win; re-check then.
const rewound = new WeakMap<HTMLVideoElement, string>();
function onPlaying(e: Event): void {
  const v = e.target;
  if (!on || !(v instanceof HTMLVideoElement)) return;
  const src = v.currentSrc || v.src;
  if (rewound.get(v) === src) return;
  rewound.set(v, src);
  const seekable: [number, number][] = [];
  for (let i = 0; i < v.seekable.length; i++) seekable.push([v.seekable.start(i), v.seekable.end(i)]);
  if (!Number.isFinite(v.duration)) console.info('[replay-guard] live stream, seekable window:', seekable);
  const target = startTarget({ duration: v.duration, currentTime: v.currentTime, seekable });
  if (target !== null) v.currentTime = target;
}

function start(): void {
  sync();
  new MutationObserver(records => {
    sync();
    if (!on) return;
    for (const r of records) {
      if (r.type === 'characterData') check(r.target);
      else for (const n of r.addedNodes) scan(n);
    }
  }).observe(document, { childList: true, subtree: true, characterData: true });
  document.addEventListener('playing', onPlaying, true); // media events don't bubble; capture sees them
  // ponytail: polling catches SPA pushState, which an isolated-world script cannot observe directly.
  setInterval(sync, 500);
}

if (document.documentElement) start();
else new MutationObserver((_, o) => { if (document.documentElement) { o.disconnect(); start(); } }).observe(document, { childList: true });
