import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafeText, isValidEmail, normalizeEmail, parseCoordinates } from '../src/utils/validation.js';

test('accepts valid geographic coordinates at supported boundaries', () => {
  assert.deepEqual(parseCoordinates('77.2090', '28.6139'), { lng: 77.209, lat: 28.6139 });
  assert.deepEqual(parseCoordinates(-180, 90), { lng: -180, lat: 90 });
});

test('rejects invalid geographic coordinates', () => {
  for (const pair of [[181, 0], [0, 91], ['north', 20], [null, 20]]) {
    assert.equal(parseCoordinates(pair[0], pair[1]), null);
  }
});

test('normalizes and validates account credentials safely', () => {
  assert.equal(normalizeEmail('  RESPONDER@NearHelp.app '), 'responder@nearhelp.app');
  assert.equal(isValidEmail('responder@nearhelp.app'), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isSafeText('A concise emergency note', { max: 50 }), true);
  assert.equal(isSafeText('x'.repeat(51), { max: 50 }), false);
});
