import assert from 'node:assert/strict';
import test from 'node:test';
import { isF1Page, isSpoiler, parseDrivers, setDrivers, startTarget } from '../src/rules.ts';

test('only FanCode F1 pages are handled', () => {
  for (const u of [
    'https://www.fancode.com/formula1',
    'https://fancode.com/formula1/',
    'https://www.fancode.com/formula1/tour/x-19295052/matches/practice-2-139503/live-match-info',
    'https://www.fancode.com/formula-1/tour/x-19295052/video-highlights/clip-224566',
    'https://www.fancode.com/tour-listing/formula1',
  ]) assert.equal(isF1Page(u), true, u);
  for (const u of [
    'https://www.fancode.com/cricket',
    'https://www.fancode.com/formula10',
    'https://www.fancode.com/tour-listing/cricket',
    'https://beta.fancode.com/formula1',
    'https://evilfancode.com/formula1',
  ]) assert.equal(isF1Page(u), false, u);
});

// Real FanCode F1 titles seen on fancode.com/formula1 (Oct 2026).
test('spoiler-looking titles are hidden', () => {
  for (const t of [
    'PODIUM SECURED! Antonelli sweeps past Hamilton in Singapore',
    'Stunning overtake: Piastri passes Hamilton for P5',
    'Singapore GP 2026 post-race drivers press conference',
    "Max Verstappen hails Red Bull's turnaround after dominant win",
    'George Russell calls for Mercedes to rediscover form',
    'Lando Norris admits McLaren have slipped to fourth in pecking order',
    'Best Audi moments from the Singapore GP 2026',
    'Hülkenberg scores',
  ]) assert.equal(isSpoiler(t), true, t);
});

test('session replay titles and navigation stay visible', () => {
  for (const t of [
    'Singapore GP 2026: Race - Full replay',
    'Singapore GP 2026: Sprint Qualifying - Full replay',
    'Race Replays 2026', 'Time for USA 2026!', 'Africa is back on the Formula 1 calendar',
    'The Sting Within Me ft. Alan Walker', 'Home', 'Live Now', 'Schedule', 'Formula 1',
    'REPLAY', '2:15:00', 'Practice 2', 'Maximum', 'Passport', 'Leadership',
  ]) assert.equal(isSpoiler(t), false, t);
});

test('first names, nicknames and unaccented spellings are caught for every driver', () => {
  for (const t of [
    'Max takes it', 'George on top in Austin', 'Alex delivers for Williams', 'Ollie scores again',
    'Checo is back', 'Kimi magic', 'Hulkenberg finally', 'Perez on the podium', 'Lance and Fernando',
  ]) assert.equal(isSpoiler(t), true, t);
});

test('drivers from the API extend the list', () => {
  assert.equal(isSpoiler('Herta impresses in FP1'), false);
  setDrivers(parseDrivers({ MRData: { DriverTable: { Drivers: [{ givenName: 'Colton', familyName: 'Herta' }] } } }));
  assert.equal(isSpoiler('Herta impresses in FP1'), true);
  assert.equal(isSpoiler('Colton impresses in FP1'), true);
  setDrivers([]);
});

test('malformed API responses are dropped', () => {
  assert.deepEqual(parseDrivers(null), []);
  assert.deepEqual(parseDrivers({ MRData: { DriverTable: { Drivers: 'x' } } }), []);
  assert.deepEqual(parseDrivers({ MRData: { DriverTable: { Drivers: [
    { givenName: 'Nico', familyName: 'Hülkenberg' },
    { givenName: '(.*)', familyName: 'Evil' },
    { givenName: 'A', familyName: 7 },
  ] } } }), ['Nico Hülkenberg']);
});

test('videos start from the beginning; live only when a DVR window exists', () => {
  assert.equal(startTarget({ duration: 8100, currentTime: 3600, seekable: [[0, 8100]] }), 0);
  assert.equal(startTarget({ duration: 8100, currentTime: 0.4, seekable: [[0, 8100]] }), null);
  assert.equal(startTarget({ duration: 8100, currentTime: 50, seekable: [] }), 0);
  assert.equal(startTarget({ duration: Infinity, currentTime: 7000, seekable: [[100, 7200]] }), 102);
  assert.equal(startTarget({ duration: Infinity, currentTime: 7000, seekable: [[6990, 7005]] }), null);
  assert.equal(startTarget({ duration: Infinity, currentTime: 7000, seekable: [] }), null);
});
