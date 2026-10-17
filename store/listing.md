# Chrome Web Store submission: Replay Guard

Ready-to-paste values for every field in the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole), in dashboard order. Text inside code blocks is meant to be pasted as-is (the dashboard takes plain text; no Markdown is rendered).

Upload file: `replay-guard.zip`, built with `npm run package` (manifest at the zip root).

## Package (from `manifest.json`, not editable in the dashboard)

| Field | Value |
| --- | --- |
| Name | `Replay Guard` |
| Summary | `Spoiler-free Formula 1 replays on FanCode: hides thumbnails and spoiler titles, and starts every video from the beginning.` (122 of 132 characters) |
| Version | `0.4.0` (every later upload needs a higher version) |
| Icon | `icons/icon-128.png` (96x96 artwork, 16 px transparent padding) |

## Store listing tab

### Description

```text
Replay Guard lets you watch Formula 1 race replays on FanCode without having the result spoiled first.

The Formula 1 section of the site shows highlight thumbnails of the winning car, titles that name the podium, and "continue watching" that drops you into the middle of a race. This extension fixes that:

• Hides every thumbnail on Formula 1 pages.
• Covers result-revealing titles with a grey bar. A title is hidden when it mentions a driver, a team or a result word (for example "wins", "podium" or a finishing position such as "P5"). Plain session titles such as "Singapore GP 2026: Race - Full replay" stay readable, so you can still find the race.
• Starts every video from the beginning. On-demand videos jump back to the start if playback resumed part-way through; live streams jump to the oldest point of the rewind window when it is at least 30 seconds long. After that first jump, seeking is entirely up to you.
• Leaves everything else alone: cricket, football and every other sport look and behave normally.

How it works
Everything runs inside the page and there is nothing to configure. To recognise driver names, the extension downloads the public list of this season's drivers from the free Jolpica F1 API once a day and keeps it in local browser storage. A built-in list of the current grid works offline.

Privacy
Replay Guard runs only on fancode.com and uses a single permission (storage, to cache that list). It has no analytics, no accounts and no tracking, and it does not collect or share any personal data. Privacy policy: https://github.com/import-keshav/replay-guard/blob/main/PRIVACY.md

Known limitations
Detection is keyword-based: a spoiler phrased without any driver, team or result word can slip through, and an unrelated title that shares a first name with a racer may be hidden too. Desktop Chrome only.

Source code and issue tracker: https://github.com/import-keshav/replay-guard

Replay Guard is an independent project. It is not affiliated with, endorsed by or connected to FanCode, Formula 1, the FIA or any team. FanCode, Formula 1 and F1 are trademarks of their respective owners.
```

### Category and language

| Field | Value |
| --- | --- |
| Category | `Entertainment` (Lifestyle group; Google defines it as "for fans of sports, music, television, and cinema") |
| Language | `English` |

### Graphic assets

| Field | File | Size |
| --- | --- | --- |
| Store icon | `icons/icon-128.png` | 128x128 PNG |
| Screenshot 1 (required, up to 5) | `store/screenshot-1280x800.png` | 1280x800 PNG |
| Small promo tile (required) | `store/promo-440x280.png` | 440x280 PNG |
| Marquee promo tile | leave empty (optional, 1400x560) | |
| Global promo video | leave empty (optional YouTube URL) | |

Regenerate the images with `npm run assets` after editing `icons/icon.svg`, `store/screenshot.html` or `store/promo.html`.

### Additional fields

| Field | Value |
| --- | --- |
| Official URL | `None` (needs a domain verified in Google Search Console; GitHub URLs can't be verified) |
| Homepage URL | `https://github.com/import-keshav/replay-guard` |
| Support URL | `https://github.com/import-keshav/replay-guard/issues` |
| Mature content | Off |

## Privacy tab

### Single purpose description

```text
Replay Guard has one purpose: letting people watch Formula 1 replays on FanCode (fancode.com) without seeing the result first. On FanCode's Formula 1 pages only, it (1) hides thumbnails, (2) covers titles that reveal results (titles naming a driver, a team or a result word such as "wins" or "P5") with a grey bar, and (3) starts videos from the beginning instead of a resumed position. All three features serve that one purpose. Other FanCode pages and all other websites are untouched.
```

### Permission justification: `storage`

```text
chrome.storage.local caches a single item: the public list of current-season Formula 1 driver names downloaded from api.jolpi.ca, plus the time of the download. This limits the download to once every 24 hours and makes the list available immediately on the next page load, so driver names in titles are hidden from the first paint. No user data is stored. Web Storage (localStorage) is not an alternative: inside a content script it belongs to fancode.com, so the website could read and overwrite it.
```

### Host permission justification (content script matches `https://fancode.com/*`, `https://www.fancode.com/*`)

```text
The content script and stylesheet are injected only on https://fancode.com/* and https://www.fancode.com/*, the site whose Formula 1 pages the extension makes spoiler-free. No other site is matched and no host_permissions are declared. The script has to be present on every FanCode page because FanCode is a single-page app: users move between Formula 1 and other sports without a page load, so the script watches the URL and only activates on Formula 1 paths (/formula1, /formula-1, /tour-listing/formula1); on all other FanCode pages it does nothing. It runs at document_start so thumbnails are hidden before they are painted. The once-a-day request to api.jolpi.ca is a plain CORS fetch of public JSON (served with Access-Control-Allow-Origin: *) and needs no host permission.
```

### Remote code

Select: **No, I am not using Remote code.**

If a justification box is shown anyway:

```text
All JavaScript is bundled in content.js inside the package; there is no eval, no new Function, no remote script tag and no dynamic import. The only network response the extension uses is a JSON document of public driver names from https://api.jolpi.ca/ergast/f1/current/drivers.json. It is parsed as data, validated (at most 100 entries, names of at most 40 letters, spaces, apostrophes, dots or hyphens), escaped, and used only as literal words to match against page titles. It is never executed.
```

### Data usage

"What user data do you plan to collect from users now or in the future?" Leave **all boxes unticked**:

| Category | Tick? | Why |
| --- | --- | --- |
| Personally identifiable information | No | None is read. |
| Health information | No | None is read. |
| Financial and payment information | No | None is read. |
| Authentication information | No | None is read. |
| Personal communications | No | None is read. |
| Location | No | None is read. |
| Web history | No | The page URL is only checked in memory to decide whether a FanCode page is a Formula 1 page; it is never stored or sent (the API request uses no referrer). |
| User activity | No | No clicks, keystrokes or network traffic are monitored. Only the video's own position is read to start it from the beginning. |
| Website content | No | Page text is only checked in memory to decide what to hide; it is never stored or sent. |

Certify **all three** statements (ticked):

- [x] I do not sell or transfer user data to third parties, outside of the approved use cases
- [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- [x] I do not use or transfer user data to determine creditworthiness or for lending purposes

### Privacy policy URL

```text
https://github.com/import-keshav/replay-guard/blob/main/PRIVACY.md
```

## Distribution tab

| Field | Value |
| --- | --- |
| Payments | Free |
| Visibility | Public (or Unlisted for a soft launch; both go through the same review) |
| Regions | All regions |

## Test instructions tab

```text
No account or setup is needed to see the core behaviour.

1. Open https://www.fancode.com/formula1. All thumbnails are hidden. Titles that mention a driver, a team or a result word (e.g. "PODIUM SECURED! ...") are covered by a grey bar, while titles such as "Singapore GP 2026: Race - Full replay" stay readable.
2. Open https://www.fancode.com/cricket (or click Cricket in the site menu). Nothing is changed; thumbnails and titles show normally.
3. Back on a Formula 1 page, start any video that FanCode resumes part-way through: it jumps to the beginning once, after which seeking works normally. Playing full replays may require a FanCode login or subscription and may be limited to certain regions; steps 1 and 2 do not.
```
