import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadSiteConfig } from './loadSiteConfig.js';

function jsonResponse(obj) {
  const s = JSON.stringify(obj);
  return Promise.resolve({
    ok: true,
    text: () => Promise.resolve(s),
  });
}

describe('loadSiteConfig', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url === '/config.local.json') {
          return Promise.resolve({ ok: false, status: 404, statusText: 'Not Found', text: () => Promise.resolve('') });
        }
        if (url === '/config.example.json') {
          return jsonResponse({ meta: { venueName: 'Ex' }, steps: [] });
        }
        return Promise.reject(new Error('unknown url ' + url));
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to example when local missing', async () => {
    const r = await loadSiteConfig();
    expect(r.usedLocal).toBe(false);
    expect(r.usedFallback).toBe(true);
    expect(r.raw.meta.venueName).toBe('Ex');
  });

  it('uses local when present', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url === '/config.local.json') {
          return jsonResponse({ meta: { venueName: 'Local' }, steps: [] });
        }
        return Promise.reject(new Error('should not fetch ' + url));
      }),
    );
    const r = await loadSiteConfig();
    expect(r.usedLocal).toBe(true);
    expect(r.usedFallback).toBe(false);
  });

  it('falls back to example when local returns HTML (SPA fallback)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url === '/config.local.json') {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve('<!DOCTYPE html><html><body>x</body></html>'),
          });
        }
        if (url === '/config.example.json') {
          return jsonResponse({ meta: { venueName: 'FromExample' }, steps: [] });
        }
        return Promise.reject(new Error('unknown url ' + url));
      }),
    );
    const r = await loadSiteConfig();
    expect(r.usedLocal).toBe(false);
    expect(r.usedFallback).toBe(true);
    expect(r.raw.meta.venueName).toBe('FromExample');
  });
});
