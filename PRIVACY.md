# Replay Guard privacy policy

Effective date: October 17, 2026

Replay Guard is a Chrome extension that hides Formula 1 spoilers on FanCode (`fancode.com`) and starts videos from the beginning. It has no account, no settings, no analytics and no server of its own. This policy describes everything the extension does with data.

## Summary

- Replay Guard does **not** collect, store, sell or share any personal data.
- The only network request it makes is a download of the public list of this season's Formula 1 drivers, at most once a day.
- The only thing it stores is that public driver list, locally in your browser.

## What the extension reads, and where

Replay Guard runs only on `https://fancode.com/*` and `https://www.fancode.com/*`. It cannot see any other website, your tabs or your browsing history.

On those pages it reads, inside your browser and only in memory:

- the address of the current page, to decide whether it is a Formula 1 page;
- the text on the page and the tab title, to decide which titles look like spoilers and hide them;
- the playback position and seekable range of the video, to start it from the beginning.

None of this is saved or sent anywhere. When you open a live stream, the extension writes the stream's rewind window (a pair of numbers) to your browser's developer console, which also stays on your device.

## Network requests

When you open a FanCode Formula 1 page and the cached driver list is missing or more than 24 hours old, Replay Guard sends one HTTPS request to the free, open-source [Jolpica F1 API](https://github.com/jolpica/jolpica-f1):

```text
GET https://api.jolpi.ca/ergast/f1/current/drivers.json?limit=100
```

The request contains no information about you or what you are watching: no cookies, no page address (it is sent with no referrer), no identifiers. As with any request on the internet, the Jolpica server receives your IP address, your browser's user agent and the `Origin` header the browser adds to cross-site requests (`https://www.fancode.com`). Jolpica is an independent third party; Replay Guard's developer does not receive or have access to any of this data.

## Data stored on your device

Replay Guard saves the downloaded driver names and the time of the download in the extension's local storage (`chrome.storage.local`, key `drivers`). This is public information, it never leaves your device, and Chrome deletes it when you remove the extension.

## Sharing, selling and advertising

Replay Guard does not sell, rent, transfer or share user data with anyone, does not use data for advertising, credit-worthiness or lending purposes, and does not run any remote code. Replay Guard's use of information complies with the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/policies), including the Limited Use requirements.

## Changes

If this policy changes, the new version will be published at this address with a new effective date. The full history is available in the repository's commit log.

## Contact

Questions or concerns: please [open an issue](https://github.com/import-keshav/replay-guard/issues) on GitHub.
