import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadSiteConfig } from './loadSiteConfig.js';

describe('loadSiteConfig', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url === '/config.local.json') {
          return Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' });
        }
        if (url === '/config.example.json') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ meta: { venueName: 'Ex' }, steps: [] }),
          });
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
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ meta: { venueName: 'Local' }, steps: [] }),
          });
        }
        return Promise.reject(new Error('should not fetch ' + url));
      }),
    );
    const r = await loadSiteConfig();
    expect(r.usedLocal).toBe(true);
    expect(r.usedFallback).toBe(false);
  });
});
